#!/bin/sh
# Copia las ofertas de empleo y sus comunicados del sistema antiguo (db-old)
# al nuevo (db-new), en el servidor de Easypanel. La landing teamwork.com.pe
# lee las ofertas de api.teamwork.com.pe, que es el sistema nuevo: sin esta
# copia la bolsa de trabajo quedaría vacía.
#
# Las dos tablas son iguales en ambos sistemas (ninguna migración nueva las
# toca) y no dependen de empresas ni de usuarios. El volcado trae también los
# contadores (setval), así las ofertas nuevas siguen numerando después.
#
# Uso, en el servidor:   sh copiar-empleos.sh
# Se detiene si la base nueva ya tiene ofertas (no duplica nada).
set -eu

ORIGEN=$(docker ps -q -f name=teamwork-apps_db-old | head -1)
DESTINO=$(docker ps -q -f name=teamwork-apps_db-new | head -1)
[ -n "$ORIGEN" ] || { echo "No encuentro el contenedor de db-old."; exit 1; }
[ -n "$DESTINO" ] || { echo "No encuentro el contenedor de db-new."; exit 1; }

U_NEW=$(docker exec "$DESTINO" printenv POSTGRES_USER)
D_NEW=$(docker exec "$DESTINO" printenv POSTGRES_DB)

YA=$(docker exec "$DESTINO" psql -U "$U_NEW" -d "$D_NEW" -tAc "select count(*) from empleo")
[ "$YA" = "0" ] || { echo "db-new ya tiene $YA ofertas: no copio nada."; exit 1; }

docker exec "$ORIGEN" pg_dump -U teamworkuser -d teamworkdb --data-only --no-owner -t empleo -t comunicado \
  | docker exec -i "$DESTINO" psql -U "$U_NEW" -d "$D_NEW" -v ON_ERROR_STOP=1 -q --single-transaction >/dev/null

docker exec "$DESTINO" psql -U "$U_NEW" -d "$D_NEW" -tAc \
  "select 'ofertas: ' || count(*) || ' (activas ' || count(*) filter (where estado) || ')' from empleo
   union all select 'comunicados: ' || count(*) from comunicado"
