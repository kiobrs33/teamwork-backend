
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Empleado
 * 
 */
export type Empleado = $Result.DefaultSelection<Prisma.$EmpleadoPayload>
/**
 * Model Usuario
 * 
 */
export type Usuario = $Result.DefaultSelection<Prisma.$UsuarioPayload>
/**
 * Model EmpresaEmpleadora
 * 
 */
export type EmpresaEmpleadora = $Result.DefaultSelection<Prisma.$EmpresaEmpleadoraPayload>
/**
 * Model EquipoEmpleadora
 * 
 */
export type EquipoEmpleadora = $Result.DefaultSelection<Prisma.$EquipoEmpleadoraPayload>
/**
 * Model PuestoEmpleadora
 * 
 */
export type PuestoEmpleadora = $Result.DefaultSelection<Prisma.$PuestoEmpleadoraPayload>
/**
 * Model UnidadEmpleadora
 * 
 */
export type UnidadEmpleadora = $Result.DefaultSelection<Prisma.$UnidadEmpleadoraPayload>
/**
 * Model Objetivo
 * 
 */
export type Objetivo = $Result.DefaultSelection<Prisma.$ObjetivoPayload>
/**
 * Model ObjetivoDetalle
 * 
 */
export type ObjetivoDetalle = $Result.DefaultSelection<Prisma.$ObjetivoDetallePayload>
/**
 * Model TablaMaestra
 * 
 */
export type TablaMaestra = $Result.DefaultSelection<Prisma.$TablaMaestraPayload>
/**
 * Model TablaMaestraDetalle
 * 
 */
export type TablaMaestraDetalle = $Result.DefaultSelection<Prisma.$TablaMaestraDetallePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Rol: {
  ADMIN: 'ADMIN',
  SUBADMIN: 'SUBADMIN',
  JEFE: 'JEFE',
  EMPLEADO: 'EMPLEADO'
};

export type Rol = (typeof Rol)[keyof typeof Rol]

}

export type Rol = $Enums.Rol

export const Rol: typeof $Enums.Rol

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Empleados
 * const empleados = await prisma.empleado.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Empleados
   * const empleados = await prisma.empleado.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.empleado`: Exposes CRUD operations for the **Empleado** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Empleados
    * const empleados = await prisma.empleado.findMany()
    * ```
    */
  get empleado(): Prisma.EmpleadoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.usuario`: Exposes CRUD operations for the **Usuario** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Usuarios
    * const usuarios = await prisma.usuario.findMany()
    * ```
    */
  get usuario(): Prisma.UsuarioDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.empresaEmpleadora`: Exposes CRUD operations for the **EmpresaEmpleadora** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more EmpresaEmpleadoras
    * const empresaEmpleadoras = await prisma.empresaEmpleadora.findMany()
    * ```
    */
  get empresaEmpleadora(): Prisma.EmpresaEmpleadoraDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.equipoEmpleadora`: Exposes CRUD operations for the **EquipoEmpleadora** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more EquipoEmpleadoras
    * const equipoEmpleadoras = await prisma.equipoEmpleadora.findMany()
    * ```
    */
  get equipoEmpleadora(): Prisma.EquipoEmpleadoraDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.puestoEmpleadora`: Exposes CRUD operations for the **PuestoEmpleadora** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PuestoEmpleadoras
    * const puestoEmpleadoras = await prisma.puestoEmpleadora.findMany()
    * ```
    */
  get puestoEmpleadora(): Prisma.PuestoEmpleadoraDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.unidadEmpleadora`: Exposes CRUD operations for the **UnidadEmpleadora** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UnidadEmpleadoras
    * const unidadEmpleadoras = await prisma.unidadEmpleadora.findMany()
    * ```
    */
  get unidadEmpleadora(): Prisma.UnidadEmpleadoraDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.objetivo`: Exposes CRUD operations for the **Objetivo** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Objetivos
    * const objetivos = await prisma.objetivo.findMany()
    * ```
    */
  get objetivo(): Prisma.ObjetivoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.objetivoDetalle`: Exposes CRUD operations for the **ObjetivoDetalle** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ObjetivoDetalles
    * const objetivoDetalles = await prisma.objetivoDetalle.findMany()
    * ```
    */
  get objetivoDetalle(): Prisma.ObjetivoDetalleDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tablaMaestra`: Exposes CRUD operations for the **TablaMaestra** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TablaMaestras
    * const tablaMaestras = await prisma.tablaMaestra.findMany()
    * ```
    */
  get tablaMaestra(): Prisma.TablaMaestraDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tablaMaestraDetalle`: Exposes CRUD operations for the **TablaMaestraDetalle** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TablaMaestraDetalles
    * const tablaMaestraDetalles = await prisma.tablaMaestraDetalle.findMany()
    * ```
    */
  get tablaMaestraDetalle(): Prisma.TablaMaestraDetalleDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.8.2
   * Query Engine version: 2060c79ba17c6bb9f5823312b6f6b7f4a845738e
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Empleado: 'Empleado',
    Usuario: 'Usuario',
    EmpresaEmpleadora: 'EmpresaEmpleadora',
    EquipoEmpleadora: 'EquipoEmpleadora',
    PuestoEmpleadora: 'PuestoEmpleadora',
    UnidadEmpleadora: 'UnidadEmpleadora',
    Objetivo: 'Objetivo',
    ObjetivoDetalle: 'ObjetivoDetalle',
    TablaMaestra: 'TablaMaestra',
    TablaMaestraDetalle: 'TablaMaestraDetalle'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "empleado" | "usuario" | "empresaEmpleadora" | "equipoEmpleadora" | "puestoEmpleadora" | "unidadEmpleadora" | "objetivo" | "objetivoDetalle" | "tablaMaestra" | "tablaMaestraDetalle"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Empleado: {
        payload: Prisma.$EmpleadoPayload<ExtArgs>
        fields: Prisma.EmpleadoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EmpleadoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpleadoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EmpleadoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpleadoPayload>
          }
          findFirst: {
            args: Prisma.EmpleadoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpleadoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EmpleadoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpleadoPayload>
          }
          findMany: {
            args: Prisma.EmpleadoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpleadoPayload>[]
          }
          create: {
            args: Prisma.EmpleadoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpleadoPayload>
          }
          createMany: {
            args: Prisma.EmpleadoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EmpleadoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpleadoPayload>[]
          }
          delete: {
            args: Prisma.EmpleadoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpleadoPayload>
          }
          update: {
            args: Prisma.EmpleadoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpleadoPayload>
          }
          deleteMany: {
            args: Prisma.EmpleadoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EmpleadoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.EmpleadoUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpleadoPayload>[]
          }
          upsert: {
            args: Prisma.EmpleadoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpleadoPayload>
          }
          aggregate: {
            args: Prisma.EmpleadoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEmpleado>
          }
          groupBy: {
            args: Prisma.EmpleadoGroupByArgs<ExtArgs>
            result: $Utils.Optional<EmpleadoGroupByOutputType>[]
          }
          count: {
            args: Prisma.EmpleadoCountArgs<ExtArgs>
            result: $Utils.Optional<EmpleadoCountAggregateOutputType> | number
          }
        }
      }
      Usuario: {
        payload: Prisma.$UsuarioPayload<ExtArgs>
        fields: Prisma.UsuarioFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UsuarioFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UsuarioFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          findFirst: {
            args: Prisma.UsuarioFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UsuarioFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          findMany: {
            args: Prisma.UsuarioFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>[]
          }
          create: {
            args: Prisma.UsuarioCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          createMany: {
            args: Prisma.UsuarioCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UsuarioCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>[]
          }
          delete: {
            args: Prisma.UsuarioDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          update: {
            args: Prisma.UsuarioUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          deleteMany: {
            args: Prisma.UsuarioDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UsuarioUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UsuarioUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>[]
          }
          upsert: {
            args: Prisma.UsuarioUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          aggregate: {
            args: Prisma.UsuarioAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUsuario>
          }
          groupBy: {
            args: Prisma.UsuarioGroupByArgs<ExtArgs>
            result: $Utils.Optional<UsuarioGroupByOutputType>[]
          }
          count: {
            args: Prisma.UsuarioCountArgs<ExtArgs>
            result: $Utils.Optional<UsuarioCountAggregateOutputType> | number
          }
        }
      }
      EmpresaEmpleadora: {
        payload: Prisma.$EmpresaEmpleadoraPayload<ExtArgs>
        fields: Prisma.EmpresaEmpleadoraFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EmpresaEmpleadoraFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpresaEmpleadoraPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EmpresaEmpleadoraFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpresaEmpleadoraPayload>
          }
          findFirst: {
            args: Prisma.EmpresaEmpleadoraFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpresaEmpleadoraPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EmpresaEmpleadoraFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpresaEmpleadoraPayload>
          }
          findMany: {
            args: Prisma.EmpresaEmpleadoraFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpresaEmpleadoraPayload>[]
          }
          create: {
            args: Prisma.EmpresaEmpleadoraCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpresaEmpleadoraPayload>
          }
          createMany: {
            args: Prisma.EmpresaEmpleadoraCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EmpresaEmpleadoraCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpresaEmpleadoraPayload>[]
          }
          delete: {
            args: Prisma.EmpresaEmpleadoraDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpresaEmpleadoraPayload>
          }
          update: {
            args: Prisma.EmpresaEmpleadoraUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpresaEmpleadoraPayload>
          }
          deleteMany: {
            args: Prisma.EmpresaEmpleadoraDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EmpresaEmpleadoraUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.EmpresaEmpleadoraUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpresaEmpleadoraPayload>[]
          }
          upsert: {
            args: Prisma.EmpresaEmpleadoraUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpresaEmpleadoraPayload>
          }
          aggregate: {
            args: Prisma.EmpresaEmpleadoraAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEmpresaEmpleadora>
          }
          groupBy: {
            args: Prisma.EmpresaEmpleadoraGroupByArgs<ExtArgs>
            result: $Utils.Optional<EmpresaEmpleadoraGroupByOutputType>[]
          }
          count: {
            args: Prisma.EmpresaEmpleadoraCountArgs<ExtArgs>
            result: $Utils.Optional<EmpresaEmpleadoraCountAggregateOutputType> | number
          }
        }
      }
      EquipoEmpleadora: {
        payload: Prisma.$EquipoEmpleadoraPayload<ExtArgs>
        fields: Prisma.EquipoEmpleadoraFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EquipoEmpleadoraFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EquipoEmpleadoraPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EquipoEmpleadoraFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EquipoEmpleadoraPayload>
          }
          findFirst: {
            args: Prisma.EquipoEmpleadoraFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EquipoEmpleadoraPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EquipoEmpleadoraFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EquipoEmpleadoraPayload>
          }
          findMany: {
            args: Prisma.EquipoEmpleadoraFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EquipoEmpleadoraPayload>[]
          }
          create: {
            args: Prisma.EquipoEmpleadoraCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EquipoEmpleadoraPayload>
          }
          createMany: {
            args: Prisma.EquipoEmpleadoraCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EquipoEmpleadoraCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EquipoEmpleadoraPayload>[]
          }
          delete: {
            args: Prisma.EquipoEmpleadoraDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EquipoEmpleadoraPayload>
          }
          update: {
            args: Prisma.EquipoEmpleadoraUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EquipoEmpleadoraPayload>
          }
          deleteMany: {
            args: Prisma.EquipoEmpleadoraDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EquipoEmpleadoraUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.EquipoEmpleadoraUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EquipoEmpleadoraPayload>[]
          }
          upsert: {
            args: Prisma.EquipoEmpleadoraUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EquipoEmpleadoraPayload>
          }
          aggregate: {
            args: Prisma.EquipoEmpleadoraAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEquipoEmpleadora>
          }
          groupBy: {
            args: Prisma.EquipoEmpleadoraGroupByArgs<ExtArgs>
            result: $Utils.Optional<EquipoEmpleadoraGroupByOutputType>[]
          }
          count: {
            args: Prisma.EquipoEmpleadoraCountArgs<ExtArgs>
            result: $Utils.Optional<EquipoEmpleadoraCountAggregateOutputType> | number
          }
        }
      }
      PuestoEmpleadora: {
        payload: Prisma.$PuestoEmpleadoraPayload<ExtArgs>
        fields: Prisma.PuestoEmpleadoraFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PuestoEmpleadoraFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PuestoEmpleadoraPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PuestoEmpleadoraFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PuestoEmpleadoraPayload>
          }
          findFirst: {
            args: Prisma.PuestoEmpleadoraFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PuestoEmpleadoraPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PuestoEmpleadoraFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PuestoEmpleadoraPayload>
          }
          findMany: {
            args: Prisma.PuestoEmpleadoraFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PuestoEmpleadoraPayload>[]
          }
          create: {
            args: Prisma.PuestoEmpleadoraCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PuestoEmpleadoraPayload>
          }
          createMany: {
            args: Prisma.PuestoEmpleadoraCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PuestoEmpleadoraCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PuestoEmpleadoraPayload>[]
          }
          delete: {
            args: Prisma.PuestoEmpleadoraDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PuestoEmpleadoraPayload>
          }
          update: {
            args: Prisma.PuestoEmpleadoraUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PuestoEmpleadoraPayload>
          }
          deleteMany: {
            args: Prisma.PuestoEmpleadoraDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PuestoEmpleadoraUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PuestoEmpleadoraUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PuestoEmpleadoraPayload>[]
          }
          upsert: {
            args: Prisma.PuestoEmpleadoraUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PuestoEmpleadoraPayload>
          }
          aggregate: {
            args: Prisma.PuestoEmpleadoraAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePuestoEmpleadora>
          }
          groupBy: {
            args: Prisma.PuestoEmpleadoraGroupByArgs<ExtArgs>
            result: $Utils.Optional<PuestoEmpleadoraGroupByOutputType>[]
          }
          count: {
            args: Prisma.PuestoEmpleadoraCountArgs<ExtArgs>
            result: $Utils.Optional<PuestoEmpleadoraCountAggregateOutputType> | number
          }
        }
      }
      UnidadEmpleadora: {
        payload: Prisma.$UnidadEmpleadoraPayload<ExtArgs>
        fields: Prisma.UnidadEmpleadoraFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UnidadEmpleadoraFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnidadEmpleadoraPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UnidadEmpleadoraFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnidadEmpleadoraPayload>
          }
          findFirst: {
            args: Prisma.UnidadEmpleadoraFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnidadEmpleadoraPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UnidadEmpleadoraFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnidadEmpleadoraPayload>
          }
          findMany: {
            args: Prisma.UnidadEmpleadoraFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnidadEmpleadoraPayload>[]
          }
          create: {
            args: Prisma.UnidadEmpleadoraCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnidadEmpleadoraPayload>
          }
          createMany: {
            args: Prisma.UnidadEmpleadoraCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UnidadEmpleadoraCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnidadEmpleadoraPayload>[]
          }
          delete: {
            args: Prisma.UnidadEmpleadoraDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnidadEmpleadoraPayload>
          }
          update: {
            args: Prisma.UnidadEmpleadoraUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnidadEmpleadoraPayload>
          }
          deleteMany: {
            args: Prisma.UnidadEmpleadoraDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UnidadEmpleadoraUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UnidadEmpleadoraUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnidadEmpleadoraPayload>[]
          }
          upsert: {
            args: Prisma.UnidadEmpleadoraUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnidadEmpleadoraPayload>
          }
          aggregate: {
            args: Prisma.UnidadEmpleadoraAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUnidadEmpleadora>
          }
          groupBy: {
            args: Prisma.UnidadEmpleadoraGroupByArgs<ExtArgs>
            result: $Utils.Optional<UnidadEmpleadoraGroupByOutputType>[]
          }
          count: {
            args: Prisma.UnidadEmpleadoraCountArgs<ExtArgs>
            result: $Utils.Optional<UnidadEmpleadoraCountAggregateOutputType> | number
          }
        }
      }
      Objetivo: {
        payload: Prisma.$ObjetivoPayload<ExtArgs>
        fields: Prisma.ObjetivoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ObjetivoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ObjetivoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoPayload>
          }
          findFirst: {
            args: Prisma.ObjetivoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ObjetivoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoPayload>
          }
          findMany: {
            args: Prisma.ObjetivoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoPayload>[]
          }
          create: {
            args: Prisma.ObjetivoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoPayload>
          }
          createMany: {
            args: Prisma.ObjetivoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ObjetivoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoPayload>[]
          }
          delete: {
            args: Prisma.ObjetivoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoPayload>
          }
          update: {
            args: Prisma.ObjetivoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoPayload>
          }
          deleteMany: {
            args: Prisma.ObjetivoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ObjetivoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ObjetivoUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoPayload>[]
          }
          upsert: {
            args: Prisma.ObjetivoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoPayload>
          }
          aggregate: {
            args: Prisma.ObjetivoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateObjetivo>
          }
          groupBy: {
            args: Prisma.ObjetivoGroupByArgs<ExtArgs>
            result: $Utils.Optional<ObjetivoGroupByOutputType>[]
          }
          count: {
            args: Prisma.ObjetivoCountArgs<ExtArgs>
            result: $Utils.Optional<ObjetivoCountAggregateOutputType> | number
          }
        }
      }
      ObjetivoDetalle: {
        payload: Prisma.$ObjetivoDetallePayload<ExtArgs>
        fields: Prisma.ObjetivoDetalleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ObjetivoDetalleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoDetallePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ObjetivoDetalleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoDetallePayload>
          }
          findFirst: {
            args: Prisma.ObjetivoDetalleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoDetallePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ObjetivoDetalleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoDetallePayload>
          }
          findMany: {
            args: Prisma.ObjetivoDetalleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoDetallePayload>[]
          }
          create: {
            args: Prisma.ObjetivoDetalleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoDetallePayload>
          }
          createMany: {
            args: Prisma.ObjetivoDetalleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ObjetivoDetalleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoDetallePayload>[]
          }
          delete: {
            args: Prisma.ObjetivoDetalleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoDetallePayload>
          }
          update: {
            args: Prisma.ObjetivoDetalleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoDetallePayload>
          }
          deleteMany: {
            args: Prisma.ObjetivoDetalleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ObjetivoDetalleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ObjetivoDetalleUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoDetallePayload>[]
          }
          upsert: {
            args: Prisma.ObjetivoDetalleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoDetallePayload>
          }
          aggregate: {
            args: Prisma.ObjetivoDetalleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateObjetivoDetalle>
          }
          groupBy: {
            args: Prisma.ObjetivoDetalleGroupByArgs<ExtArgs>
            result: $Utils.Optional<ObjetivoDetalleGroupByOutputType>[]
          }
          count: {
            args: Prisma.ObjetivoDetalleCountArgs<ExtArgs>
            result: $Utils.Optional<ObjetivoDetalleCountAggregateOutputType> | number
          }
        }
      }
      TablaMaestra: {
        payload: Prisma.$TablaMaestraPayload<ExtArgs>
        fields: Prisma.TablaMaestraFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TablaMaestraFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TablaMaestraPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TablaMaestraFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TablaMaestraPayload>
          }
          findFirst: {
            args: Prisma.TablaMaestraFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TablaMaestraPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TablaMaestraFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TablaMaestraPayload>
          }
          findMany: {
            args: Prisma.TablaMaestraFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TablaMaestraPayload>[]
          }
          create: {
            args: Prisma.TablaMaestraCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TablaMaestraPayload>
          }
          createMany: {
            args: Prisma.TablaMaestraCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TablaMaestraCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TablaMaestraPayload>[]
          }
          delete: {
            args: Prisma.TablaMaestraDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TablaMaestraPayload>
          }
          update: {
            args: Prisma.TablaMaestraUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TablaMaestraPayload>
          }
          deleteMany: {
            args: Prisma.TablaMaestraDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TablaMaestraUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TablaMaestraUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TablaMaestraPayload>[]
          }
          upsert: {
            args: Prisma.TablaMaestraUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TablaMaestraPayload>
          }
          aggregate: {
            args: Prisma.TablaMaestraAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTablaMaestra>
          }
          groupBy: {
            args: Prisma.TablaMaestraGroupByArgs<ExtArgs>
            result: $Utils.Optional<TablaMaestraGroupByOutputType>[]
          }
          count: {
            args: Prisma.TablaMaestraCountArgs<ExtArgs>
            result: $Utils.Optional<TablaMaestraCountAggregateOutputType> | number
          }
        }
      }
      TablaMaestraDetalle: {
        payload: Prisma.$TablaMaestraDetallePayload<ExtArgs>
        fields: Prisma.TablaMaestraDetalleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TablaMaestraDetalleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TablaMaestraDetallePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TablaMaestraDetalleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TablaMaestraDetallePayload>
          }
          findFirst: {
            args: Prisma.TablaMaestraDetalleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TablaMaestraDetallePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TablaMaestraDetalleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TablaMaestraDetallePayload>
          }
          findMany: {
            args: Prisma.TablaMaestraDetalleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TablaMaestraDetallePayload>[]
          }
          create: {
            args: Prisma.TablaMaestraDetalleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TablaMaestraDetallePayload>
          }
          createMany: {
            args: Prisma.TablaMaestraDetalleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TablaMaestraDetalleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TablaMaestraDetallePayload>[]
          }
          delete: {
            args: Prisma.TablaMaestraDetalleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TablaMaestraDetallePayload>
          }
          update: {
            args: Prisma.TablaMaestraDetalleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TablaMaestraDetallePayload>
          }
          deleteMany: {
            args: Prisma.TablaMaestraDetalleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TablaMaestraDetalleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TablaMaestraDetalleUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TablaMaestraDetallePayload>[]
          }
          upsert: {
            args: Prisma.TablaMaestraDetalleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TablaMaestraDetallePayload>
          }
          aggregate: {
            args: Prisma.TablaMaestraDetalleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTablaMaestraDetalle>
          }
          groupBy: {
            args: Prisma.TablaMaestraDetalleGroupByArgs<ExtArgs>
            result: $Utils.Optional<TablaMaestraDetalleGroupByOutputType>[]
          }
          count: {
            args: Prisma.TablaMaestraDetalleCountArgs<ExtArgs>
            result: $Utils.Optional<TablaMaestraDetalleCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    empleado?: EmpleadoOmit
    usuario?: UsuarioOmit
    empresaEmpleadora?: EmpresaEmpleadoraOmit
    equipoEmpleadora?: EquipoEmpleadoraOmit
    puestoEmpleadora?: PuestoEmpleadoraOmit
    unidadEmpleadora?: UnidadEmpleadoraOmit
    objetivo?: ObjetivoOmit
    objetivoDetalle?: ObjetivoDetalleOmit
    tablaMaestra?: TablaMaestraOmit
    tablaMaestraDetalle?: TablaMaestraDetalleOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type EmpleadoCountOutputType
   */

  export type EmpleadoCountOutputType = {
    objetivo: number
  }

  export type EmpleadoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    objetivo?: boolean | EmpleadoCountOutputTypeCountObjetivoArgs
  }

  // Custom InputTypes
  /**
   * EmpleadoCountOutputType without action
   */
  export type EmpleadoCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmpleadoCountOutputType
     */
    select?: EmpleadoCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * EmpleadoCountOutputType without action
   */
  export type EmpleadoCountOutputTypeCountObjetivoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ObjetivoWhereInput
  }


  /**
   * Count Type UsuarioCountOutputType
   */

  export type UsuarioCountOutputType = {
    empleado: number
  }

  export type UsuarioCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    empleado?: boolean | UsuarioCountOutputTypeCountEmpleadoArgs
  }

  // Custom InputTypes
  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsuarioCountOutputType
     */
    select?: UsuarioCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeCountEmpleadoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmpleadoWhereInput
  }


  /**
   * Count Type EmpresaEmpleadoraCountOutputType
   */

  export type EmpresaEmpleadoraCountOutputType = {
    equipoEmpleadora: number
    puestoEmpleadora: number
    unidadEmpleadora: number
    objetivo: number
    empleado: number
  }

  export type EmpresaEmpleadoraCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    equipoEmpleadora?: boolean | EmpresaEmpleadoraCountOutputTypeCountEquipoEmpleadoraArgs
    puestoEmpleadora?: boolean | EmpresaEmpleadoraCountOutputTypeCountPuestoEmpleadoraArgs
    unidadEmpleadora?: boolean | EmpresaEmpleadoraCountOutputTypeCountUnidadEmpleadoraArgs
    objetivo?: boolean | EmpresaEmpleadoraCountOutputTypeCountObjetivoArgs
    empleado?: boolean | EmpresaEmpleadoraCountOutputTypeCountEmpleadoArgs
  }

  // Custom InputTypes
  /**
   * EmpresaEmpleadoraCountOutputType without action
   */
  export type EmpresaEmpleadoraCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmpresaEmpleadoraCountOutputType
     */
    select?: EmpresaEmpleadoraCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * EmpresaEmpleadoraCountOutputType without action
   */
  export type EmpresaEmpleadoraCountOutputTypeCountEquipoEmpleadoraArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EquipoEmpleadoraWhereInput
  }

  /**
   * EmpresaEmpleadoraCountOutputType without action
   */
  export type EmpresaEmpleadoraCountOutputTypeCountPuestoEmpleadoraArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PuestoEmpleadoraWhereInput
  }

  /**
   * EmpresaEmpleadoraCountOutputType without action
   */
  export type EmpresaEmpleadoraCountOutputTypeCountUnidadEmpleadoraArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UnidadEmpleadoraWhereInput
  }

  /**
   * EmpresaEmpleadoraCountOutputType without action
   */
  export type EmpresaEmpleadoraCountOutputTypeCountObjetivoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ObjetivoWhereInput
  }

  /**
   * EmpresaEmpleadoraCountOutputType without action
   */
  export type EmpresaEmpleadoraCountOutputTypeCountEmpleadoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmpleadoWhereInput
  }


  /**
   * Count Type EquipoEmpleadoraCountOutputType
   */

  export type EquipoEmpleadoraCountOutputType = {
    Empleado: number
  }

  export type EquipoEmpleadoraCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Empleado?: boolean | EquipoEmpleadoraCountOutputTypeCountEmpleadoArgs
  }

  // Custom InputTypes
  /**
   * EquipoEmpleadoraCountOutputType without action
   */
  export type EquipoEmpleadoraCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EquipoEmpleadoraCountOutputType
     */
    select?: EquipoEmpleadoraCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * EquipoEmpleadoraCountOutputType without action
   */
  export type EquipoEmpleadoraCountOutputTypeCountEmpleadoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmpleadoWhereInput
  }


  /**
   * Count Type PuestoEmpleadoraCountOutputType
   */

  export type PuestoEmpleadoraCountOutputType = {
    Empleado: number
  }

  export type PuestoEmpleadoraCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Empleado?: boolean | PuestoEmpleadoraCountOutputTypeCountEmpleadoArgs
  }

  // Custom InputTypes
  /**
   * PuestoEmpleadoraCountOutputType without action
   */
  export type PuestoEmpleadoraCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PuestoEmpleadoraCountOutputType
     */
    select?: PuestoEmpleadoraCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PuestoEmpleadoraCountOutputType without action
   */
  export type PuestoEmpleadoraCountOutputTypeCountEmpleadoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmpleadoWhereInput
  }


  /**
   * Count Type UnidadEmpleadoraCountOutputType
   */

  export type UnidadEmpleadoraCountOutputType = {
    empleado: number
  }

  export type UnidadEmpleadoraCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    empleado?: boolean | UnidadEmpleadoraCountOutputTypeCountEmpleadoArgs
  }

  // Custom InputTypes
  /**
   * UnidadEmpleadoraCountOutputType without action
   */
  export type UnidadEmpleadoraCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnidadEmpleadoraCountOutputType
     */
    select?: UnidadEmpleadoraCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UnidadEmpleadoraCountOutputType without action
   */
  export type UnidadEmpleadoraCountOutputTypeCountEmpleadoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmpleadoWhereInput
  }


  /**
   * Count Type ObjetivoCountOutputType
   */

  export type ObjetivoCountOutputType = {
    ObjetivoDetalle: number
  }

  export type ObjetivoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ObjetivoDetalle?: boolean | ObjetivoCountOutputTypeCountObjetivoDetalleArgs
  }

  // Custom InputTypes
  /**
   * ObjetivoCountOutputType without action
   */
  export type ObjetivoCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ObjetivoCountOutputType
     */
    select?: ObjetivoCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ObjetivoCountOutputType without action
   */
  export type ObjetivoCountOutputTypeCountObjetivoDetalleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ObjetivoDetalleWhereInput
  }


  /**
   * Count Type TablaMaestraCountOutputType
   */

  export type TablaMaestraCountOutputType = {
    TablaMaestraDetalle: number
  }

  export type TablaMaestraCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    TablaMaestraDetalle?: boolean | TablaMaestraCountOutputTypeCountTablaMaestraDetalleArgs
  }

  // Custom InputTypes
  /**
   * TablaMaestraCountOutputType without action
   */
  export type TablaMaestraCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TablaMaestraCountOutputType
     */
    select?: TablaMaestraCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TablaMaestraCountOutputType without action
   */
  export type TablaMaestraCountOutputTypeCountTablaMaestraDetalleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TablaMaestraDetalleWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Empleado
   */

  export type AggregateEmpleado = {
    _count: EmpleadoCountAggregateOutputType | null
    _avg: EmpleadoAvgAggregateOutputType | null
    _sum: EmpleadoSumAggregateOutputType | null
    _min: EmpleadoMinAggregateOutputType | null
    _max: EmpleadoMaxAggregateOutputType | null
  }

  export type EmpleadoAvgAggregateOutputType = {
    idEmpleado: number | null
    idEmpresaEmpleadora: number | null
    idEquipoEmpleadora: number | null
    idPuestoEmpleadora: number | null
    idUnidadEmpleadora: number | null
    idUsuario: number | null
    creadoPorId: number | null
    actualizadoPorId: number | null
  }

  export type EmpleadoSumAggregateOutputType = {
    idEmpleado: number | null
    idEmpresaEmpleadora: number | null
    idEquipoEmpleadora: number | null
    idPuestoEmpleadora: number | null
    idUnidadEmpleadora: number | null
    idUsuario: number | null
    creadoPorId: number | null
    actualizadoPorId: number | null
  }

  export type EmpleadoMinAggregateOutputType = {
    idEmpleado: number | null
    nombres: string | null
    apellidoPaterno: string | null
    apellidoMaterno: string | null
    idEmpresaEmpleadora: number | null
    idEquipoEmpleadora: number | null
    idPuestoEmpleadora: number | null
    idUnidadEmpleadora: number | null
    idUsuario: number | null
    estado: boolean | null
    creadoPorId: number | null
    actualizadoPorId: number | null
    fechaCreacion: Date | null
    fechaModificacion: Date | null
  }

  export type EmpleadoMaxAggregateOutputType = {
    idEmpleado: number | null
    nombres: string | null
    apellidoPaterno: string | null
    apellidoMaterno: string | null
    idEmpresaEmpleadora: number | null
    idEquipoEmpleadora: number | null
    idPuestoEmpleadora: number | null
    idUnidadEmpleadora: number | null
    idUsuario: number | null
    estado: boolean | null
    creadoPorId: number | null
    actualizadoPorId: number | null
    fechaCreacion: Date | null
    fechaModificacion: Date | null
  }

  export type EmpleadoCountAggregateOutputType = {
    idEmpleado: number
    nombres: number
    apellidoPaterno: number
    apellidoMaterno: number
    idEmpresaEmpleadora: number
    idEquipoEmpleadora: number
    idPuestoEmpleadora: number
    idUnidadEmpleadora: number
    idUsuario: number
    estado: number
    creadoPorId: number
    actualizadoPorId: number
    fechaCreacion: number
    fechaModificacion: number
    _all: number
  }


  export type EmpleadoAvgAggregateInputType = {
    idEmpleado?: true
    idEmpresaEmpleadora?: true
    idEquipoEmpleadora?: true
    idPuestoEmpleadora?: true
    idUnidadEmpleadora?: true
    idUsuario?: true
    creadoPorId?: true
    actualizadoPorId?: true
  }

  export type EmpleadoSumAggregateInputType = {
    idEmpleado?: true
    idEmpresaEmpleadora?: true
    idEquipoEmpleadora?: true
    idPuestoEmpleadora?: true
    idUnidadEmpleadora?: true
    idUsuario?: true
    creadoPorId?: true
    actualizadoPorId?: true
  }

  export type EmpleadoMinAggregateInputType = {
    idEmpleado?: true
    nombres?: true
    apellidoPaterno?: true
    apellidoMaterno?: true
    idEmpresaEmpleadora?: true
    idEquipoEmpleadora?: true
    idPuestoEmpleadora?: true
    idUnidadEmpleadora?: true
    idUsuario?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
  }

  export type EmpleadoMaxAggregateInputType = {
    idEmpleado?: true
    nombres?: true
    apellidoPaterno?: true
    apellidoMaterno?: true
    idEmpresaEmpleadora?: true
    idEquipoEmpleadora?: true
    idPuestoEmpleadora?: true
    idUnidadEmpleadora?: true
    idUsuario?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
  }

  export type EmpleadoCountAggregateInputType = {
    idEmpleado?: true
    nombres?: true
    apellidoPaterno?: true
    apellidoMaterno?: true
    idEmpresaEmpleadora?: true
    idEquipoEmpleadora?: true
    idPuestoEmpleadora?: true
    idUnidadEmpleadora?: true
    idUsuario?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
    _all?: true
  }

  export type EmpleadoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Empleado to aggregate.
     */
    where?: EmpleadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Empleados to fetch.
     */
    orderBy?: EmpleadoOrderByWithRelationInput | EmpleadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EmpleadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Empleados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Empleados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Empleados
    **/
    _count?: true | EmpleadoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EmpleadoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EmpleadoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EmpleadoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EmpleadoMaxAggregateInputType
  }

  export type GetEmpleadoAggregateType<T extends EmpleadoAggregateArgs> = {
        [P in keyof T & keyof AggregateEmpleado]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEmpleado[P]>
      : GetScalarType<T[P], AggregateEmpleado[P]>
  }




  export type EmpleadoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmpleadoWhereInput
    orderBy?: EmpleadoOrderByWithAggregationInput | EmpleadoOrderByWithAggregationInput[]
    by: EmpleadoScalarFieldEnum[] | EmpleadoScalarFieldEnum
    having?: EmpleadoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EmpleadoCountAggregateInputType | true
    _avg?: EmpleadoAvgAggregateInputType
    _sum?: EmpleadoSumAggregateInputType
    _min?: EmpleadoMinAggregateInputType
    _max?: EmpleadoMaxAggregateInputType
  }

  export type EmpleadoGroupByOutputType = {
    idEmpleado: number
    nombres: string
    apellidoPaterno: string
    apellidoMaterno: string
    idEmpresaEmpleadora: number
    idEquipoEmpleadora: number
    idPuestoEmpleadora: number
    idUnidadEmpleadora: number
    idUsuario: number
    estado: boolean
    creadoPorId: number
    actualizadoPorId: number | null
    fechaCreacion: Date
    fechaModificacion: Date | null
    _count: EmpleadoCountAggregateOutputType | null
    _avg: EmpleadoAvgAggregateOutputType | null
    _sum: EmpleadoSumAggregateOutputType | null
    _min: EmpleadoMinAggregateOutputType | null
    _max: EmpleadoMaxAggregateOutputType | null
  }

  type GetEmpleadoGroupByPayload<T extends EmpleadoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EmpleadoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EmpleadoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EmpleadoGroupByOutputType[P]>
            : GetScalarType<T[P], EmpleadoGroupByOutputType[P]>
        }
      >
    >


  export type EmpleadoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idEmpleado?: boolean
    nombres?: boolean
    apellidoPaterno?: boolean
    apellidoMaterno?: boolean
    idEmpresaEmpleadora?: boolean
    idEquipoEmpleadora?: boolean
    idPuestoEmpleadora?: boolean
    idUnidadEmpleadora?: boolean
    idUsuario?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
    equipoEmpleadora?: boolean | EquipoEmpleadoraDefaultArgs<ExtArgs>
    puestoEmpleadora?: boolean | PuestoEmpleadoraDefaultArgs<ExtArgs>
    unidadEmpleadora?: boolean | UnidadEmpleadoraDefaultArgs<ExtArgs>
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
    objetivo?: boolean | Empleado$objetivoArgs<ExtArgs>
    _count?: boolean | EmpleadoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["empleado"]>

  export type EmpleadoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idEmpleado?: boolean
    nombres?: boolean
    apellidoPaterno?: boolean
    apellidoMaterno?: boolean
    idEmpresaEmpleadora?: boolean
    idEquipoEmpleadora?: boolean
    idPuestoEmpleadora?: boolean
    idUnidadEmpleadora?: boolean
    idUsuario?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
    equipoEmpleadora?: boolean | EquipoEmpleadoraDefaultArgs<ExtArgs>
    puestoEmpleadora?: boolean | PuestoEmpleadoraDefaultArgs<ExtArgs>
    unidadEmpleadora?: boolean | UnidadEmpleadoraDefaultArgs<ExtArgs>
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["empleado"]>

  export type EmpleadoSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idEmpleado?: boolean
    nombres?: boolean
    apellidoPaterno?: boolean
    apellidoMaterno?: boolean
    idEmpresaEmpleadora?: boolean
    idEquipoEmpleadora?: boolean
    idPuestoEmpleadora?: boolean
    idUnidadEmpleadora?: boolean
    idUsuario?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
    equipoEmpleadora?: boolean | EquipoEmpleadoraDefaultArgs<ExtArgs>
    puestoEmpleadora?: boolean | PuestoEmpleadoraDefaultArgs<ExtArgs>
    unidadEmpleadora?: boolean | UnidadEmpleadoraDefaultArgs<ExtArgs>
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["empleado"]>

  export type EmpleadoSelectScalar = {
    idEmpleado?: boolean
    nombres?: boolean
    apellidoPaterno?: boolean
    apellidoMaterno?: boolean
    idEmpresaEmpleadora?: boolean
    idEquipoEmpleadora?: boolean
    idPuestoEmpleadora?: boolean
    idUnidadEmpleadora?: boolean
    idUsuario?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
  }

  export type EmpleadoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"idEmpleado" | "nombres" | "apellidoPaterno" | "apellidoMaterno" | "idEmpresaEmpleadora" | "idEquipoEmpleadora" | "idPuestoEmpleadora" | "idUnidadEmpleadora" | "idUsuario" | "estado" | "creadoPorId" | "actualizadoPorId" | "fechaCreacion" | "fechaModificacion", ExtArgs["result"]["empleado"]>
  export type EmpleadoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
    equipoEmpleadora?: boolean | EquipoEmpleadoraDefaultArgs<ExtArgs>
    puestoEmpleadora?: boolean | PuestoEmpleadoraDefaultArgs<ExtArgs>
    unidadEmpleadora?: boolean | UnidadEmpleadoraDefaultArgs<ExtArgs>
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
    objetivo?: boolean | Empleado$objetivoArgs<ExtArgs>
    _count?: boolean | EmpleadoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type EmpleadoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
    equipoEmpleadora?: boolean | EquipoEmpleadoraDefaultArgs<ExtArgs>
    puestoEmpleadora?: boolean | PuestoEmpleadoraDefaultArgs<ExtArgs>
    unidadEmpleadora?: boolean | UnidadEmpleadoraDefaultArgs<ExtArgs>
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }
  export type EmpleadoIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
    equipoEmpleadora?: boolean | EquipoEmpleadoraDefaultArgs<ExtArgs>
    puestoEmpleadora?: boolean | PuestoEmpleadoraDefaultArgs<ExtArgs>
    unidadEmpleadora?: boolean | UnidadEmpleadoraDefaultArgs<ExtArgs>
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }

  export type $EmpleadoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Empleado"
    objects: {
      empresaEmpleadora: Prisma.$EmpresaEmpleadoraPayload<ExtArgs>
      equipoEmpleadora: Prisma.$EquipoEmpleadoraPayload<ExtArgs>
      puestoEmpleadora: Prisma.$PuestoEmpleadoraPayload<ExtArgs>
      unidadEmpleadora: Prisma.$UnidadEmpleadoraPayload<ExtArgs>
      usuario: Prisma.$UsuarioPayload<ExtArgs>
      objetivo: Prisma.$ObjetivoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      idEmpleado: number
      nombres: string
      apellidoPaterno: string
      apellidoMaterno: string
      idEmpresaEmpleadora: number
      idEquipoEmpleadora: number
      idPuestoEmpleadora: number
      idUnidadEmpleadora: number
      idUsuario: number
      estado: boolean
      creadoPorId: number
      actualizadoPorId: number | null
      fechaCreacion: Date
      fechaModificacion: Date | null
    }, ExtArgs["result"]["empleado"]>
    composites: {}
  }

  type EmpleadoGetPayload<S extends boolean | null | undefined | EmpleadoDefaultArgs> = $Result.GetResult<Prisma.$EmpleadoPayload, S>

  type EmpleadoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<EmpleadoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: EmpleadoCountAggregateInputType | true
    }

  export interface EmpleadoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Empleado'], meta: { name: 'Empleado' } }
    /**
     * Find zero or one Empleado that matches the filter.
     * @param {EmpleadoFindUniqueArgs} args - Arguments to find a Empleado
     * @example
     * // Get one Empleado
     * const empleado = await prisma.empleado.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EmpleadoFindUniqueArgs>(args: SelectSubset<T, EmpleadoFindUniqueArgs<ExtArgs>>): Prisma__EmpleadoClient<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Empleado that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {EmpleadoFindUniqueOrThrowArgs} args - Arguments to find a Empleado
     * @example
     * // Get one Empleado
     * const empleado = await prisma.empleado.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EmpleadoFindUniqueOrThrowArgs>(args: SelectSubset<T, EmpleadoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EmpleadoClient<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Empleado that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpleadoFindFirstArgs} args - Arguments to find a Empleado
     * @example
     * // Get one Empleado
     * const empleado = await prisma.empleado.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EmpleadoFindFirstArgs>(args?: SelectSubset<T, EmpleadoFindFirstArgs<ExtArgs>>): Prisma__EmpleadoClient<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Empleado that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpleadoFindFirstOrThrowArgs} args - Arguments to find a Empleado
     * @example
     * // Get one Empleado
     * const empleado = await prisma.empleado.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EmpleadoFindFirstOrThrowArgs>(args?: SelectSubset<T, EmpleadoFindFirstOrThrowArgs<ExtArgs>>): Prisma__EmpleadoClient<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Empleados that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpleadoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Empleados
     * const empleados = await prisma.empleado.findMany()
     * 
     * // Get first 10 Empleados
     * const empleados = await prisma.empleado.findMany({ take: 10 })
     * 
     * // Only select the `idEmpleado`
     * const empleadoWithIdEmpleadoOnly = await prisma.empleado.findMany({ select: { idEmpleado: true } })
     * 
     */
    findMany<T extends EmpleadoFindManyArgs>(args?: SelectSubset<T, EmpleadoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Empleado.
     * @param {EmpleadoCreateArgs} args - Arguments to create a Empleado.
     * @example
     * // Create one Empleado
     * const Empleado = await prisma.empleado.create({
     *   data: {
     *     // ... data to create a Empleado
     *   }
     * })
     * 
     */
    create<T extends EmpleadoCreateArgs>(args: SelectSubset<T, EmpleadoCreateArgs<ExtArgs>>): Prisma__EmpleadoClient<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Empleados.
     * @param {EmpleadoCreateManyArgs} args - Arguments to create many Empleados.
     * @example
     * // Create many Empleados
     * const empleado = await prisma.empleado.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EmpleadoCreateManyArgs>(args?: SelectSubset<T, EmpleadoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Empleados and returns the data saved in the database.
     * @param {EmpleadoCreateManyAndReturnArgs} args - Arguments to create many Empleados.
     * @example
     * // Create many Empleados
     * const empleado = await prisma.empleado.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Empleados and only return the `idEmpleado`
     * const empleadoWithIdEmpleadoOnly = await prisma.empleado.createManyAndReturn({
     *   select: { idEmpleado: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EmpleadoCreateManyAndReturnArgs>(args?: SelectSubset<T, EmpleadoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Empleado.
     * @param {EmpleadoDeleteArgs} args - Arguments to delete one Empleado.
     * @example
     * // Delete one Empleado
     * const Empleado = await prisma.empleado.delete({
     *   where: {
     *     // ... filter to delete one Empleado
     *   }
     * })
     * 
     */
    delete<T extends EmpleadoDeleteArgs>(args: SelectSubset<T, EmpleadoDeleteArgs<ExtArgs>>): Prisma__EmpleadoClient<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Empleado.
     * @param {EmpleadoUpdateArgs} args - Arguments to update one Empleado.
     * @example
     * // Update one Empleado
     * const empleado = await prisma.empleado.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EmpleadoUpdateArgs>(args: SelectSubset<T, EmpleadoUpdateArgs<ExtArgs>>): Prisma__EmpleadoClient<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Empleados.
     * @param {EmpleadoDeleteManyArgs} args - Arguments to filter Empleados to delete.
     * @example
     * // Delete a few Empleados
     * const { count } = await prisma.empleado.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EmpleadoDeleteManyArgs>(args?: SelectSubset<T, EmpleadoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Empleados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpleadoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Empleados
     * const empleado = await prisma.empleado.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EmpleadoUpdateManyArgs>(args: SelectSubset<T, EmpleadoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Empleados and returns the data updated in the database.
     * @param {EmpleadoUpdateManyAndReturnArgs} args - Arguments to update many Empleados.
     * @example
     * // Update many Empleados
     * const empleado = await prisma.empleado.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Empleados and only return the `idEmpleado`
     * const empleadoWithIdEmpleadoOnly = await prisma.empleado.updateManyAndReturn({
     *   select: { idEmpleado: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends EmpleadoUpdateManyAndReturnArgs>(args: SelectSubset<T, EmpleadoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Empleado.
     * @param {EmpleadoUpsertArgs} args - Arguments to update or create a Empleado.
     * @example
     * // Update or create a Empleado
     * const empleado = await prisma.empleado.upsert({
     *   create: {
     *     // ... data to create a Empleado
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Empleado we want to update
     *   }
     * })
     */
    upsert<T extends EmpleadoUpsertArgs>(args: SelectSubset<T, EmpleadoUpsertArgs<ExtArgs>>): Prisma__EmpleadoClient<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Empleados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpleadoCountArgs} args - Arguments to filter Empleados to count.
     * @example
     * // Count the number of Empleados
     * const count = await prisma.empleado.count({
     *   where: {
     *     // ... the filter for the Empleados we want to count
     *   }
     * })
    **/
    count<T extends EmpleadoCountArgs>(
      args?: Subset<T, EmpleadoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EmpleadoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Empleado.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpleadoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EmpleadoAggregateArgs>(args: Subset<T, EmpleadoAggregateArgs>): Prisma.PrismaPromise<GetEmpleadoAggregateType<T>>

    /**
     * Group by Empleado.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpleadoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EmpleadoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EmpleadoGroupByArgs['orderBy'] }
        : { orderBy?: EmpleadoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EmpleadoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEmpleadoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Empleado model
   */
  readonly fields: EmpleadoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Empleado.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EmpleadoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    empresaEmpleadora<T extends EmpresaEmpleadoraDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EmpresaEmpleadoraDefaultArgs<ExtArgs>>): Prisma__EmpresaEmpleadoraClient<$Result.GetResult<Prisma.$EmpresaEmpleadoraPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    equipoEmpleadora<T extends EquipoEmpleadoraDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EquipoEmpleadoraDefaultArgs<ExtArgs>>): Prisma__EquipoEmpleadoraClient<$Result.GetResult<Prisma.$EquipoEmpleadoraPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    puestoEmpleadora<T extends PuestoEmpleadoraDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PuestoEmpleadoraDefaultArgs<ExtArgs>>): Prisma__PuestoEmpleadoraClient<$Result.GetResult<Prisma.$PuestoEmpleadoraPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    unidadEmpleadora<T extends UnidadEmpleadoraDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UnidadEmpleadoraDefaultArgs<ExtArgs>>): Prisma__UnidadEmpleadoraClient<$Result.GetResult<Prisma.$UnidadEmpleadoraPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    usuario<T extends UsuarioDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UsuarioDefaultArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    objetivo<T extends Empleado$objetivoArgs<ExtArgs> = {}>(args?: Subset<T, Empleado$objetivoArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ObjetivoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Empleado model
   */
  interface EmpleadoFieldRefs {
    readonly idEmpleado: FieldRef<"Empleado", 'Int'>
    readonly nombres: FieldRef<"Empleado", 'String'>
    readonly apellidoPaterno: FieldRef<"Empleado", 'String'>
    readonly apellidoMaterno: FieldRef<"Empleado", 'String'>
    readonly idEmpresaEmpleadora: FieldRef<"Empleado", 'Int'>
    readonly idEquipoEmpleadora: FieldRef<"Empleado", 'Int'>
    readonly idPuestoEmpleadora: FieldRef<"Empleado", 'Int'>
    readonly idUnidadEmpleadora: FieldRef<"Empleado", 'Int'>
    readonly idUsuario: FieldRef<"Empleado", 'Int'>
    readonly estado: FieldRef<"Empleado", 'Boolean'>
    readonly creadoPorId: FieldRef<"Empleado", 'Int'>
    readonly actualizadoPorId: FieldRef<"Empleado", 'Int'>
    readonly fechaCreacion: FieldRef<"Empleado", 'DateTime'>
    readonly fechaModificacion: FieldRef<"Empleado", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Empleado findUnique
   */
  export type EmpleadoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Empleado
     */
    omit?: EmpleadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoInclude<ExtArgs> | null
    /**
     * Filter, which Empleado to fetch.
     */
    where: EmpleadoWhereUniqueInput
  }

  /**
   * Empleado findUniqueOrThrow
   */
  export type EmpleadoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Empleado
     */
    omit?: EmpleadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoInclude<ExtArgs> | null
    /**
     * Filter, which Empleado to fetch.
     */
    where: EmpleadoWhereUniqueInput
  }

  /**
   * Empleado findFirst
   */
  export type EmpleadoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Empleado
     */
    omit?: EmpleadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoInclude<ExtArgs> | null
    /**
     * Filter, which Empleado to fetch.
     */
    where?: EmpleadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Empleados to fetch.
     */
    orderBy?: EmpleadoOrderByWithRelationInput | EmpleadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Empleados.
     */
    cursor?: EmpleadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Empleados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Empleados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Empleados.
     */
    distinct?: EmpleadoScalarFieldEnum | EmpleadoScalarFieldEnum[]
  }

  /**
   * Empleado findFirstOrThrow
   */
  export type EmpleadoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Empleado
     */
    omit?: EmpleadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoInclude<ExtArgs> | null
    /**
     * Filter, which Empleado to fetch.
     */
    where?: EmpleadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Empleados to fetch.
     */
    orderBy?: EmpleadoOrderByWithRelationInput | EmpleadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Empleados.
     */
    cursor?: EmpleadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Empleados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Empleados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Empleados.
     */
    distinct?: EmpleadoScalarFieldEnum | EmpleadoScalarFieldEnum[]
  }

  /**
   * Empleado findMany
   */
  export type EmpleadoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Empleado
     */
    omit?: EmpleadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoInclude<ExtArgs> | null
    /**
     * Filter, which Empleados to fetch.
     */
    where?: EmpleadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Empleados to fetch.
     */
    orderBy?: EmpleadoOrderByWithRelationInput | EmpleadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Empleados.
     */
    cursor?: EmpleadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Empleados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Empleados.
     */
    skip?: number
    distinct?: EmpleadoScalarFieldEnum | EmpleadoScalarFieldEnum[]
  }

  /**
   * Empleado create
   */
  export type EmpleadoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Empleado
     */
    omit?: EmpleadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoInclude<ExtArgs> | null
    /**
     * The data needed to create a Empleado.
     */
    data: XOR<EmpleadoCreateInput, EmpleadoUncheckedCreateInput>
  }

  /**
   * Empleado createMany
   */
  export type EmpleadoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Empleados.
     */
    data: EmpleadoCreateManyInput | EmpleadoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Empleado createManyAndReturn
   */
  export type EmpleadoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Empleado
     */
    omit?: EmpleadoOmit<ExtArgs> | null
    /**
     * The data used to create many Empleados.
     */
    data: EmpleadoCreateManyInput | EmpleadoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Empleado update
   */
  export type EmpleadoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Empleado
     */
    omit?: EmpleadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoInclude<ExtArgs> | null
    /**
     * The data needed to update a Empleado.
     */
    data: XOR<EmpleadoUpdateInput, EmpleadoUncheckedUpdateInput>
    /**
     * Choose, which Empleado to update.
     */
    where: EmpleadoWhereUniqueInput
  }

  /**
   * Empleado updateMany
   */
  export type EmpleadoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Empleados.
     */
    data: XOR<EmpleadoUpdateManyMutationInput, EmpleadoUncheckedUpdateManyInput>
    /**
     * Filter which Empleados to update
     */
    where?: EmpleadoWhereInput
    /**
     * Limit how many Empleados to update.
     */
    limit?: number
  }

  /**
   * Empleado updateManyAndReturn
   */
  export type EmpleadoUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Empleado
     */
    omit?: EmpleadoOmit<ExtArgs> | null
    /**
     * The data used to update Empleados.
     */
    data: XOR<EmpleadoUpdateManyMutationInput, EmpleadoUncheckedUpdateManyInput>
    /**
     * Filter which Empleados to update
     */
    where?: EmpleadoWhereInput
    /**
     * Limit how many Empleados to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Empleado upsert
   */
  export type EmpleadoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Empleado
     */
    omit?: EmpleadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoInclude<ExtArgs> | null
    /**
     * The filter to search for the Empleado to update in case it exists.
     */
    where: EmpleadoWhereUniqueInput
    /**
     * In case the Empleado found by the `where` argument doesn't exist, create a new Empleado with this data.
     */
    create: XOR<EmpleadoCreateInput, EmpleadoUncheckedCreateInput>
    /**
     * In case the Empleado was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EmpleadoUpdateInput, EmpleadoUncheckedUpdateInput>
  }

  /**
   * Empleado delete
   */
  export type EmpleadoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Empleado
     */
    omit?: EmpleadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoInclude<ExtArgs> | null
    /**
     * Filter which Empleado to delete.
     */
    where: EmpleadoWhereUniqueInput
  }

  /**
   * Empleado deleteMany
   */
  export type EmpleadoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Empleados to delete
     */
    where?: EmpleadoWhereInput
    /**
     * Limit how many Empleados to delete.
     */
    limit?: number
  }

  /**
   * Empleado.objetivo
   */
  export type Empleado$objetivoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoInclude<ExtArgs> | null
    where?: ObjetivoWhereInput
    orderBy?: ObjetivoOrderByWithRelationInput | ObjetivoOrderByWithRelationInput[]
    cursor?: ObjetivoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ObjetivoScalarFieldEnum | ObjetivoScalarFieldEnum[]
  }

  /**
   * Empleado without action
   */
  export type EmpleadoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Empleado
     */
    omit?: EmpleadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoInclude<ExtArgs> | null
  }


  /**
   * Model Usuario
   */

  export type AggregateUsuario = {
    _count: UsuarioCountAggregateOutputType | null
    _avg: UsuarioAvgAggregateOutputType | null
    _sum: UsuarioSumAggregateOutputType | null
    _min: UsuarioMinAggregateOutputType | null
    _max: UsuarioMaxAggregateOutputType | null
  }

  export type UsuarioAvgAggregateOutputType = {
    idUsuario: number | null
    creadoPorId: number | null
    actualizadoPorId: number | null
  }

  export type UsuarioSumAggregateOutputType = {
    idUsuario: number | null
    creadoPorId: number | null
    actualizadoPorId: number | null
  }

  export type UsuarioMinAggregateOutputType = {
    idUsuario: number | null
    codigoUsuario: string | null
    correoElectronico: string | null
    contrasena: string | null
    rol: $Enums.Rol | null
    estado: boolean | null
    creadoPorId: number | null
    actualizadoPorId: number | null
    fechaCreacion: Date | null
    fechaModificacion: Date | null
  }

  export type UsuarioMaxAggregateOutputType = {
    idUsuario: number | null
    codigoUsuario: string | null
    correoElectronico: string | null
    contrasena: string | null
    rol: $Enums.Rol | null
    estado: boolean | null
    creadoPorId: number | null
    actualizadoPorId: number | null
    fechaCreacion: Date | null
    fechaModificacion: Date | null
  }

  export type UsuarioCountAggregateOutputType = {
    idUsuario: number
    codigoUsuario: number
    correoElectronico: number
    contrasena: number
    rol: number
    estado: number
    creadoPorId: number
    actualizadoPorId: number
    fechaCreacion: number
    fechaModificacion: number
    _all: number
  }


  export type UsuarioAvgAggregateInputType = {
    idUsuario?: true
    creadoPorId?: true
    actualizadoPorId?: true
  }

  export type UsuarioSumAggregateInputType = {
    idUsuario?: true
    creadoPorId?: true
    actualizadoPorId?: true
  }

  export type UsuarioMinAggregateInputType = {
    idUsuario?: true
    codigoUsuario?: true
    correoElectronico?: true
    contrasena?: true
    rol?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
  }

  export type UsuarioMaxAggregateInputType = {
    idUsuario?: true
    codigoUsuario?: true
    correoElectronico?: true
    contrasena?: true
    rol?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
  }

  export type UsuarioCountAggregateInputType = {
    idUsuario?: true
    codigoUsuario?: true
    correoElectronico?: true
    contrasena?: true
    rol?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
    _all?: true
  }

  export type UsuarioAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Usuario to aggregate.
     */
    where?: UsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Usuarios to fetch.
     */
    orderBy?: UsuarioOrderByWithRelationInput | UsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Usuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Usuarios
    **/
    _count?: true | UsuarioCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UsuarioAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UsuarioSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UsuarioMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UsuarioMaxAggregateInputType
  }

  export type GetUsuarioAggregateType<T extends UsuarioAggregateArgs> = {
        [P in keyof T & keyof AggregateUsuario]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUsuario[P]>
      : GetScalarType<T[P], AggregateUsuario[P]>
  }




  export type UsuarioGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UsuarioWhereInput
    orderBy?: UsuarioOrderByWithAggregationInput | UsuarioOrderByWithAggregationInput[]
    by: UsuarioScalarFieldEnum[] | UsuarioScalarFieldEnum
    having?: UsuarioScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UsuarioCountAggregateInputType | true
    _avg?: UsuarioAvgAggregateInputType
    _sum?: UsuarioSumAggregateInputType
    _min?: UsuarioMinAggregateInputType
    _max?: UsuarioMaxAggregateInputType
  }

  export type UsuarioGroupByOutputType = {
    idUsuario: number
    codigoUsuario: string
    correoElectronico: string | null
    contrasena: string
    rol: $Enums.Rol
    estado: boolean
    creadoPorId: number
    actualizadoPorId: number | null
    fechaCreacion: Date
    fechaModificacion: Date | null
    _count: UsuarioCountAggregateOutputType | null
    _avg: UsuarioAvgAggregateOutputType | null
    _sum: UsuarioSumAggregateOutputType | null
    _min: UsuarioMinAggregateOutputType | null
    _max: UsuarioMaxAggregateOutputType | null
  }

  type GetUsuarioGroupByPayload<T extends UsuarioGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UsuarioGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UsuarioGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UsuarioGroupByOutputType[P]>
            : GetScalarType<T[P], UsuarioGroupByOutputType[P]>
        }
      >
    >


  export type UsuarioSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idUsuario?: boolean
    codigoUsuario?: boolean
    correoElectronico?: boolean
    contrasena?: boolean
    rol?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
    empleado?: boolean | Usuario$empleadoArgs<ExtArgs>
    _count?: boolean | UsuarioCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["usuario"]>

  export type UsuarioSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idUsuario?: boolean
    codigoUsuario?: boolean
    correoElectronico?: boolean
    contrasena?: boolean
    rol?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
  }, ExtArgs["result"]["usuario"]>

  export type UsuarioSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idUsuario?: boolean
    codigoUsuario?: boolean
    correoElectronico?: boolean
    contrasena?: boolean
    rol?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
  }, ExtArgs["result"]["usuario"]>

  export type UsuarioSelectScalar = {
    idUsuario?: boolean
    codigoUsuario?: boolean
    correoElectronico?: boolean
    contrasena?: boolean
    rol?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
  }

  export type UsuarioOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"idUsuario" | "codigoUsuario" | "correoElectronico" | "contrasena" | "rol" | "estado" | "creadoPorId" | "actualizadoPorId" | "fechaCreacion" | "fechaModificacion", ExtArgs["result"]["usuario"]>
  export type UsuarioInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    empleado?: boolean | Usuario$empleadoArgs<ExtArgs>
    _count?: boolean | UsuarioCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UsuarioIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UsuarioIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UsuarioPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Usuario"
    objects: {
      empleado: Prisma.$EmpleadoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      idUsuario: number
      codigoUsuario: string
      correoElectronico: string | null
      contrasena: string
      rol: $Enums.Rol
      estado: boolean
      creadoPorId: number
      actualizadoPorId: number | null
      fechaCreacion: Date
      fechaModificacion: Date | null
    }, ExtArgs["result"]["usuario"]>
    composites: {}
  }

  type UsuarioGetPayload<S extends boolean | null | undefined | UsuarioDefaultArgs> = $Result.GetResult<Prisma.$UsuarioPayload, S>

  type UsuarioCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UsuarioFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UsuarioCountAggregateInputType | true
    }

  export interface UsuarioDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Usuario'], meta: { name: 'Usuario' } }
    /**
     * Find zero or one Usuario that matches the filter.
     * @param {UsuarioFindUniqueArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UsuarioFindUniqueArgs>(args: SelectSubset<T, UsuarioFindUniqueArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Usuario that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UsuarioFindUniqueOrThrowArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UsuarioFindUniqueOrThrowArgs>(args: SelectSubset<T, UsuarioFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Usuario that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioFindFirstArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UsuarioFindFirstArgs>(args?: SelectSubset<T, UsuarioFindFirstArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Usuario that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioFindFirstOrThrowArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UsuarioFindFirstOrThrowArgs>(args?: SelectSubset<T, UsuarioFindFirstOrThrowArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Usuarios that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Usuarios
     * const usuarios = await prisma.usuario.findMany()
     * 
     * // Get first 10 Usuarios
     * const usuarios = await prisma.usuario.findMany({ take: 10 })
     * 
     * // Only select the `idUsuario`
     * const usuarioWithIdUsuarioOnly = await prisma.usuario.findMany({ select: { idUsuario: true } })
     * 
     */
    findMany<T extends UsuarioFindManyArgs>(args?: SelectSubset<T, UsuarioFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Usuario.
     * @param {UsuarioCreateArgs} args - Arguments to create a Usuario.
     * @example
     * // Create one Usuario
     * const Usuario = await prisma.usuario.create({
     *   data: {
     *     // ... data to create a Usuario
     *   }
     * })
     * 
     */
    create<T extends UsuarioCreateArgs>(args: SelectSubset<T, UsuarioCreateArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Usuarios.
     * @param {UsuarioCreateManyArgs} args - Arguments to create many Usuarios.
     * @example
     * // Create many Usuarios
     * const usuario = await prisma.usuario.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UsuarioCreateManyArgs>(args?: SelectSubset<T, UsuarioCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Usuarios and returns the data saved in the database.
     * @param {UsuarioCreateManyAndReturnArgs} args - Arguments to create many Usuarios.
     * @example
     * // Create many Usuarios
     * const usuario = await prisma.usuario.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Usuarios and only return the `idUsuario`
     * const usuarioWithIdUsuarioOnly = await prisma.usuario.createManyAndReturn({
     *   select: { idUsuario: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UsuarioCreateManyAndReturnArgs>(args?: SelectSubset<T, UsuarioCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Usuario.
     * @param {UsuarioDeleteArgs} args - Arguments to delete one Usuario.
     * @example
     * // Delete one Usuario
     * const Usuario = await prisma.usuario.delete({
     *   where: {
     *     // ... filter to delete one Usuario
     *   }
     * })
     * 
     */
    delete<T extends UsuarioDeleteArgs>(args: SelectSubset<T, UsuarioDeleteArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Usuario.
     * @param {UsuarioUpdateArgs} args - Arguments to update one Usuario.
     * @example
     * // Update one Usuario
     * const usuario = await prisma.usuario.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UsuarioUpdateArgs>(args: SelectSubset<T, UsuarioUpdateArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Usuarios.
     * @param {UsuarioDeleteManyArgs} args - Arguments to filter Usuarios to delete.
     * @example
     * // Delete a few Usuarios
     * const { count } = await prisma.usuario.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UsuarioDeleteManyArgs>(args?: SelectSubset<T, UsuarioDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Usuarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Usuarios
     * const usuario = await prisma.usuario.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UsuarioUpdateManyArgs>(args: SelectSubset<T, UsuarioUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Usuarios and returns the data updated in the database.
     * @param {UsuarioUpdateManyAndReturnArgs} args - Arguments to update many Usuarios.
     * @example
     * // Update many Usuarios
     * const usuario = await prisma.usuario.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Usuarios and only return the `idUsuario`
     * const usuarioWithIdUsuarioOnly = await prisma.usuario.updateManyAndReturn({
     *   select: { idUsuario: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UsuarioUpdateManyAndReturnArgs>(args: SelectSubset<T, UsuarioUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Usuario.
     * @param {UsuarioUpsertArgs} args - Arguments to update or create a Usuario.
     * @example
     * // Update or create a Usuario
     * const usuario = await prisma.usuario.upsert({
     *   create: {
     *     // ... data to create a Usuario
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Usuario we want to update
     *   }
     * })
     */
    upsert<T extends UsuarioUpsertArgs>(args: SelectSubset<T, UsuarioUpsertArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Usuarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioCountArgs} args - Arguments to filter Usuarios to count.
     * @example
     * // Count the number of Usuarios
     * const count = await prisma.usuario.count({
     *   where: {
     *     // ... the filter for the Usuarios we want to count
     *   }
     * })
    **/
    count<T extends UsuarioCountArgs>(
      args?: Subset<T, UsuarioCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UsuarioCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Usuario.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UsuarioAggregateArgs>(args: Subset<T, UsuarioAggregateArgs>): Prisma.PrismaPromise<GetUsuarioAggregateType<T>>

    /**
     * Group by Usuario.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UsuarioGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UsuarioGroupByArgs['orderBy'] }
        : { orderBy?: UsuarioGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UsuarioGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUsuarioGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Usuario model
   */
  readonly fields: UsuarioFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Usuario.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UsuarioClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    empleado<T extends Usuario$empleadoArgs<ExtArgs> = {}>(args?: Subset<T, Usuario$empleadoArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Usuario model
   */
  interface UsuarioFieldRefs {
    readonly idUsuario: FieldRef<"Usuario", 'Int'>
    readonly codigoUsuario: FieldRef<"Usuario", 'String'>
    readonly correoElectronico: FieldRef<"Usuario", 'String'>
    readonly contrasena: FieldRef<"Usuario", 'String'>
    readonly rol: FieldRef<"Usuario", 'Rol'>
    readonly estado: FieldRef<"Usuario", 'Boolean'>
    readonly creadoPorId: FieldRef<"Usuario", 'Int'>
    readonly actualizadoPorId: FieldRef<"Usuario", 'Int'>
    readonly fechaCreacion: FieldRef<"Usuario", 'DateTime'>
    readonly fechaModificacion: FieldRef<"Usuario", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Usuario findUnique
   */
  export type UsuarioFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuario to fetch.
     */
    where: UsuarioWhereUniqueInput
  }

  /**
   * Usuario findUniqueOrThrow
   */
  export type UsuarioFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuario to fetch.
     */
    where: UsuarioWhereUniqueInput
  }

  /**
   * Usuario findFirst
   */
  export type UsuarioFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuario to fetch.
     */
    where?: UsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Usuarios to fetch.
     */
    orderBy?: UsuarioOrderByWithRelationInput | UsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Usuarios.
     */
    cursor?: UsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Usuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Usuarios.
     */
    distinct?: UsuarioScalarFieldEnum | UsuarioScalarFieldEnum[]
  }

  /**
   * Usuario findFirstOrThrow
   */
  export type UsuarioFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuario to fetch.
     */
    where?: UsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Usuarios to fetch.
     */
    orderBy?: UsuarioOrderByWithRelationInput | UsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Usuarios.
     */
    cursor?: UsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Usuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Usuarios.
     */
    distinct?: UsuarioScalarFieldEnum | UsuarioScalarFieldEnum[]
  }

  /**
   * Usuario findMany
   */
  export type UsuarioFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuarios to fetch.
     */
    where?: UsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Usuarios to fetch.
     */
    orderBy?: UsuarioOrderByWithRelationInput | UsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Usuarios.
     */
    cursor?: UsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Usuarios.
     */
    skip?: number
    distinct?: UsuarioScalarFieldEnum | UsuarioScalarFieldEnum[]
  }

  /**
   * Usuario create
   */
  export type UsuarioCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * The data needed to create a Usuario.
     */
    data: XOR<UsuarioCreateInput, UsuarioUncheckedCreateInput>
  }

  /**
   * Usuario createMany
   */
  export type UsuarioCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Usuarios.
     */
    data: UsuarioCreateManyInput | UsuarioCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Usuario createManyAndReturn
   */
  export type UsuarioCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * The data used to create many Usuarios.
     */
    data: UsuarioCreateManyInput | UsuarioCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Usuario update
   */
  export type UsuarioUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * The data needed to update a Usuario.
     */
    data: XOR<UsuarioUpdateInput, UsuarioUncheckedUpdateInput>
    /**
     * Choose, which Usuario to update.
     */
    where: UsuarioWhereUniqueInput
  }

  /**
   * Usuario updateMany
   */
  export type UsuarioUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Usuarios.
     */
    data: XOR<UsuarioUpdateManyMutationInput, UsuarioUncheckedUpdateManyInput>
    /**
     * Filter which Usuarios to update
     */
    where?: UsuarioWhereInput
    /**
     * Limit how many Usuarios to update.
     */
    limit?: number
  }

  /**
   * Usuario updateManyAndReturn
   */
  export type UsuarioUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * The data used to update Usuarios.
     */
    data: XOR<UsuarioUpdateManyMutationInput, UsuarioUncheckedUpdateManyInput>
    /**
     * Filter which Usuarios to update
     */
    where?: UsuarioWhereInput
    /**
     * Limit how many Usuarios to update.
     */
    limit?: number
  }

  /**
   * Usuario upsert
   */
  export type UsuarioUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * The filter to search for the Usuario to update in case it exists.
     */
    where: UsuarioWhereUniqueInput
    /**
     * In case the Usuario found by the `where` argument doesn't exist, create a new Usuario with this data.
     */
    create: XOR<UsuarioCreateInput, UsuarioUncheckedCreateInput>
    /**
     * In case the Usuario was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UsuarioUpdateInput, UsuarioUncheckedUpdateInput>
  }

  /**
   * Usuario delete
   */
  export type UsuarioDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter which Usuario to delete.
     */
    where: UsuarioWhereUniqueInput
  }

  /**
   * Usuario deleteMany
   */
  export type UsuarioDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Usuarios to delete
     */
    where?: UsuarioWhereInput
    /**
     * Limit how many Usuarios to delete.
     */
    limit?: number
  }

  /**
   * Usuario.empleado
   */
  export type Usuario$empleadoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Empleado
     */
    omit?: EmpleadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoInclude<ExtArgs> | null
    where?: EmpleadoWhereInput
    orderBy?: EmpleadoOrderByWithRelationInput | EmpleadoOrderByWithRelationInput[]
    cursor?: EmpleadoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EmpleadoScalarFieldEnum | EmpleadoScalarFieldEnum[]
  }

  /**
   * Usuario without action
   */
  export type UsuarioDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
  }


  /**
   * Model EmpresaEmpleadora
   */

  export type AggregateEmpresaEmpleadora = {
    _count: EmpresaEmpleadoraCountAggregateOutputType | null
    _avg: EmpresaEmpleadoraAvgAggregateOutputType | null
    _sum: EmpresaEmpleadoraSumAggregateOutputType | null
    _min: EmpresaEmpleadoraMinAggregateOutputType | null
    _max: EmpresaEmpleadoraMaxAggregateOutputType | null
  }

  export type EmpresaEmpleadoraAvgAggregateOutputType = {
    idEmpresaEmpleadora: number | null
    creadoPorId: number | null
    actualizadoPorId: number | null
  }

  export type EmpresaEmpleadoraSumAggregateOutputType = {
    idEmpresaEmpleadora: number | null
    creadoPorId: number | null
    actualizadoPorId: number | null
  }

  export type EmpresaEmpleadoraMinAggregateOutputType = {
    idEmpresaEmpleadora: number | null
    nombreEmpresa: string | null
    ruc: string | null
    direccionEmpresa: string | null
    urlLogo: string | null
    fechaVigenciaInicio: Date | null
    fechaVigenciaFin: Date | null
    estado: boolean | null
    creadoPorId: number | null
    actualizadoPorId: number | null
    fechaCreacion: Date | null
    fechaModificacion: Date | null
  }

  export type EmpresaEmpleadoraMaxAggregateOutputType = {
    idEmpresaEmpleadora: number | null
    nombreEmpresa: string | null
    ruc: string | null
    direccionEmpresa: string | null
    urlLogo: string | null
    fechaVigenciaInicio: Date | null
    fechaVigenciaFin: Date | null
    estado: boolean | null
    creadoPorId: number | null
    actualizadoPorId: number | null
    fechaCreacion: Date | null
    fechaModificacion: Date | null
  }

  export type EmpresaEmpleadoraCountAggregateOutputType = {
    idEmpresaEmpleadora: number
    nombreEmpresa: number
    ruc: number
    direccionEmpresa: number
    urlLogo: number
    fechaVigenciaInicio: number
    fechaVigenciaFin: number
    estado: number
    creadoPorId: number
    actualizadoPorId: number
    fechaCreacion: number
    fechaModificacion: number
    _all: number
  }


  export type EmpresaEmpleadoraAvgAggregateInputType = {
    idEmpresaEmpleadora?: true
    creadoPorId?: true
    actualizadoPorId?: true
  }

  export type EmpresaEmpleadoraSumAggregateInputType = {
    idEmpresaEmpleadora?: true
    creadoPorId?: true
    actualizadoPorId?: true
  }

  export type EmpresaEmpleadoraMinAggregateInputType = {
    idEmpresaEmpleadora?: true
    nombreEmpresa?: true
    ruc?: true
    direccionEmpresa?: true
    urlLogo?: true
    fechaVigenciaInicio?: true
    fechaVigenciaFin?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
  }

  export type EmpresaEmpleadoraMaxAggregateInputType = {
    idEmpresaEmpleadora?: true
    nombreEmpresa?: true
    ruc?: true
    direccionEmpresa?: true
    urlLogo?: true
    fechaVigenciaInicio?: true
    fechaVigenciaFin?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
  }

  export type EmpresaEmpleadoraCountAggregateInputType = {
    idEmpresaEmpleadora?: true
    nombreEmpresa?: true
    ruc?: true
    direccionEmpresa?: true
    urlLogo?: true
    fechaVigenciaInicio?: true
    fechaVigenciaFin?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
    _all?: true
  }

  export type EmpresaEmpleadoraAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EmpresaEmpleadora to aggregate.
     */
    where?: EmpresaEmpleadoraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmpresaEmpleadoras to fetch.
     */
    orderBy?: EmpresaEmpleadoraOrderByWithRelationInput | EmpresaEmpleadoraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EmpresaEmpleadoraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmpresaEmpleadoras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmpresaEmpleadoras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned EmpresaEmpleadoras
    **/
    _count?: true | EmpresaEmpleadoraCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EmpresaEmpleadoraAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EmpresaEmpleadoraSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EmpresaEmpleadoraMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EmpresaEmpleadoraMaxAggregateInputType
  }

  export type GetEmpresaEmpleadoraAggregateType<T extends EmpresaEmpleadoraAggregateArgs> = {
        [P in keyof T & keyof AggregateEmpresaEmpleadora]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEmpresaEmpleadora[P]>
      : GetScalarType<T[P], AggregateEmpresaEmpleadora[P]>
  }




  export type EmpresaEmpleadoraGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmpresaEmpleadoraWhereInput
    orderBy?: EmpresaEmpleadoraOrderByWithAggregationInput | EmpresaEmpleadoraOrderByWithAggregationInput[]
    by: EmpresaEmpleadoraScalarFieldEnum[] | EmpresaEmpleadoraScalarFieldEnum
    having?: EmpresaEmpleadoraScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EmpresaEmpleadoraCountAggregateInputType | true
    _avg?: EmpresaEmpleadoraAvgAggregateInputType
    _sum?: EmpresaEmpleadoraSumAggregateInputType
    _min?: EmpresaEmpleadoraMinAggregateInputType
    _max?: EmpresaEmpleadoraMaxAggregateInputType
  }

  export type EmpresaEmpleadoraGroupByOutputType = {
    idEmpresaEmpleadora: number
    nombreEmpresa: string
    ruc: string | null
    direccionEmpresa: string | null
    urlLogo: string
    fechaVigenciaInicio: Date
    fechaVigenciaFin: Date
    estado: boolean
    creadoPorId: number
    actualizadoPorId: number | null
    fechaCreacion: Date
    fechaModificacion: Date | null
    _count: EmpresaEmpleadoraCountAggregateOutputType | null
    _avg: EmpresaEmpleadoraAvgAggregateOutputType | null
    _sum: EmpresaEmpleadoraSumAggregateOutputType | null
    _min: EmpresaEmpleadoraMinAggregateOutputType | null
    _max: EmpresaEmpleadoraMaxAggregateOutputType | null
  }

  type GetEmpresaEmpleadoraGroupByPayload<T extends EmpresaEmpleadoraGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EmpresaEmpleadoraGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EmpresaEmpleadoraGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EmpresaEmpleadoraGroupByOutputType[P]>
            : GetScalarType<T[P], EmpresaEmpleadoraGroupByOutputType[P]>
        }
      >
    >


  export type EmpresaEmpleadoraSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idEmpresaEmpleadora?: boolean
    nombreEmpresa?: boolean
    ruc?: boolean
    direccionEmpresa?: boolean
    urlLogo?: boolean
    fechaVigenciaInicio?: boolean
    fechaVigenciaFin?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
    equipoEmpleadora?: boolean | EmpresaEmpleadora$equipoEmpleadoraArgs<ExtArgs>
    puestoEmpleadora?: boolean | EmpresaEmpleadora$puestoEmpleadoraArgs<ExtArgs>
    unidadEmpleadora?: boolean | EmpresaEmpleadora$unidadEmpleadoraArgs<ExtArgs>
    objetivo?: boolean | EmpresaEmpleadora$objetivoArgs<ExtArgs>
    empleado?: boolean | EmpresaEmpleadora$empleadoArgs<ExtArgs>
    _count?: boolean | EmpresaEmpleadoraCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["empresaEmpleadora"]>

  export type EmpresaEmpleadoraSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idEmpresaEmpleadora?: boolean
    nombreEmpresa?: boolean
    ruc?: boolean
    direccionEmpresa?: boolean
    urlLogo?: boolean
    fechaVigenciaInicio?: boolean
    fechaVigenciaFin?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
  }, ExtArgs["result"]["empresaEmpleadora"]>

  export type EmpresaEmpleadoraSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idEmpresaEmpleadora?: boolean
    nombreEmpresa?: boolean
    ruc?: boolean
    direccionEmpresa?: boolean
    urlLogo?: boolean
    fechaVigenciaInicio?: boolean
    fechaVigenciaFin?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
  }, ExtArgs["result"]["empresaEmpleadora"]>

  export type EmpresaEmpleadoraSelectScalar = {
    idEmpresaEmpleadora?: boolean
    nombreEmpresa?: boolean
    ruc?: boolean
    direccionEmpresa?: boolean
    urlLogo?: boolean
    fechaVigenciaInicio?: boolean
    fechaVigenciaFin?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
  }

  export type EmpresaEmpleadoraOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"idEmpresaEmpleadora" | "nombreEmpresa" | "ruc" | "direccionEmpresa" | "urlLogo" | "fechaVigenciaInicio" | "fechaVigenciaFin" | "estado" | "creadoPorId" | "actualizadoPorId" | "fechaCreacion" | "fechaModificacion", ExtArgs["result"]["empresaEmpleadora"]>
  export type EmpresaEmpleadoraInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    equipoEmpleadora?: boolean | EmpresaEmpleadora$equipoEmpleadoraArgs<ExtArgs>
    puestoEmpleadora?: boolean | EmpresaEmpleadora$puestoEmpleadoraArgs<ExtArgs>
    unidadEmpleadora?: boolean | EmpresaEmpleadora$unidadEmpleadoraArgs<ExtArgs>
    objetivo?: boolean | EmpresaEmpleadora$objetivoArgs<ExtArgs>
    empleado?: boolean | EmpresaEmpleadora$empleadoArgs<ExtArgs>
    _count?: boolean | EmpresaEmpleadoraCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type EmpresaEmpleadoraIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type EmpresaEmpleadoraIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $EmpresaEmpleadoraPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "EmpresaEmpleadora"
    objects: {
      equipoEmpleadora: Prisma.$EquipoEmpleadoraPayload<ExtArgs>[]
      puestoEmpleadora: Prisma.$PuestoEmpleadoraPayload<ExtArgs>[]
      unidadEmpleadora: Prisma.$UnidadEmpleadoraPayload<ExtArgs>[]
      objetivo: Prisma.$ObjetivoPayload<ExtArgs>[]
      empleado: Prisma.$EmpleadoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      idEmpresaEmpleadora: number
      nombreEmpresa: string
      ruc: string | null
      direccionEmpresa: string | null
      urlLogo: string
      fechaVigenciaInicio: Date
      fechaVigenciaFin: Date
      estado: boolean
      creadoPorId: number
      actualizadoPorId: number | null
      fechaCreacion: Date
      fechaModificacion: Date | null
    }, ExtArgs["result"]["empresaEmpleadora"]>
    composites: {}
  }

  type EmpresaEmpleadoraGetPayload<S extends boolean | null | undefined | EmpresaEmpleadoraDefaultArgs> = $Result.GetResult<Prisma.$EmpresaEmpleadoraPayload, S>

  type EmpresaEmpleadoraCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<EmpresaEmpleadoraFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: EmpresaEmpleadoraCountAggregateInputType | true
    }

  export interface EmpresaEmpleadoraDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['EmpresaEmpleadora'], meta: { name: 'EmpresaEmpleadora' } }
    /**
     * Find zero or one EmpresaEmpleadora that matches the filter.
     * @param {EmpresaEmpleadoraFindUniqueArgs} args - Arguments to find a EmpresaEmpleadora
     * @example
     * // Get one EmpresaEmpleadora
     * const empresaEmpleadora = await prisma.empresaEmpleadora.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EmpresaEmpleadoraFindUniqueArgs>(args: SelectSubset<T, EmpresaEmpleadoraFindUniqueArgs<ExtArgs>>): Prisma__EmpresaEmpleadoraClient<$Result.GetResult<Prisma.$EmpresaEmpleadoraPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one EmpresaEmpleadora that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {EmpresaEmpleadoraFindUniqueOrThrowArgs} args - Arguments to find a EmpresaEmpleadora
     * @example
     * // Get one EmpresaEmpleadora
     * const empresaEmpleadora = await prisma.empresaEmpleadora.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EmpresaEmpleadoraFindUniqueOrThrowArgs>(args: SelectSubset<T, EmpresaEmpleadoraFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EmpresaEmpleadoraClient<$Result.GetResult<Prisma.$EmpresaEmpleadoraPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first EmpresaEmpleadora that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpresaEmpleadoraFindFirstArgs} args - Arguments to find a EmpresaEmpleadora
     * @example
     * // Get one EmpresaEmpleadora
     * const empresaEmpleadora = await prisma.empresaEmpleadora.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EmpresaEmpleadoraFindFirstArgs>(args?: SelectSubset<T, EmpresaEmpleadoraFindFirstArgs<ExtArgs>>): Prisma__EmpresaEmpleadoraClient<$Result.GetResult<Prisma.$EmpresaEmpleadoraPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first EmpresaEmpleadora that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpresaEmpleadoraFindFirstOrThrowArgs} args - Arguments to find a EmpresaEmpleadora
     * @example
     * // Get one EmpresaEmpleadora
     * const empresaEmpleadora = await prisma.empresaEmpleadora.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EmpresaEmpleadoraFindFirstOrThrowArgs>(args?: SelectSubset<T, EmpresaEmpleadoraFindFirstOrThrowArgs<ExtArgs>>): Prisma__EmpresaEmpleadoraClient<$Result.GetResult<Prisma.$EmpresaEmpleadoraPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more EmpresaEmpleadoras that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpresaEmpleadoraFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all EmpresaEmpleadoras
     * const empresaEmpleadoras = await prisma.empresaEmpleadora.findMany()
     * 
     * // Get first 10 EmpresaEmpleadoras
     * const empresaEmpleadoras = await prisma.empresaEmpleadora.findMany({ take: 10 })
     * 
     * // Only select the `idEmpresaEmpleadora`
     * const empresaEmpleadoraWithIdEmpresaEmpleadoraOnly = await prisma.empresaEmpleadora.findMany({ select: { idEmpresaEmpleadora: true } })
     * 
     */
    findMany<T extends EmpresaEmpleadoraFindManyArgs>(args?: SelectSubset<T, EmpresaEmpleadoraFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmpresaEmpleadoraPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a EmpresaEmpleadora.
     * @param {EmpresaEmpleadoraCreateArgs} args - Arguments to create a EmpresaEmpleadora.
     * @example
     * // Create one EmpresaEmpleadora
     * const EmpresaEmpleadora = await prisma.empresaEmpleadora.create({
     *   data: {
     *     // ... data to create a EmpresaEmpleadora
     *   }
     * })
     * 
     */
    create<T extends EmpresaEmpleadoraCreateArgs>(args: SelectSubset<T, EmpresaEmpleadoraCreateArgs<ExtArgs>>): Prisma__EmpresaEmpleadoraClient<$Result.GetResult<Prisma.$EmpresaEmpleadoraPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many EmpresaEmpleadoras.
     * @param {EmpresaEmpleadoraCreateManyArgs} args - Arguments to create many EmpresaEmpleadoras.
     * @example
     * // Create many EmpresaEmpleadoras
     * const empresaEmpleadora = await prisma.empresaEmpleadora.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EmpresaEmpleadoraCreateManyArgs>(args?: SelectSubset<T, EmpresaEmpleadoraCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many EmpresaEmpleadoras and returns the data saved in the database.
     * @param {EmpresaEmpleadoraCreateManyAndReturnArgs} args - Arguments to create many EmpresaEmpleadoras.
     * @example
     * // Create many EmpresaEmpleadoras
     * const empresaEmpleadora = await prisma.empresaEmpleadora.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many EmpresaEmpleadoras and only return the `idEmpresaEmpleadora`
     * const empresaEmpleadoraWithIdEmpresaEmpleadoraOnly = await prisma.empresaEmpleadora.createManyAndReturn({
     *   select: { idEmpresaEmpleadora: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EmpresaEmpleadoraCreateManyAndReturnArgs>(args?: SelectSubset<T, EmpresaEmpleadoraCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmpresaEmpleadoraPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a EmpresaEmpleadora.
     * @param {EmpresaEmpleadoraDeleteArgs} args - Arguments to delete one EmpresaEmpleadora.
     * @example
     * // Delete one EmpresaEmpleadora
     * const EmpresaEmpleadora = await prisma.empresaEmpleadora.delete({
     *   where: {
     *     // ... filter to delete one EmpresaEmpleadora
     *   }
     * })
     * 
     */
    delete<T extends EmpresaEmpleadoraDeleteArgs>(args: SelectSubset<T, EmpresaEmpleadoraDeleteArgs<ExtArgs>>): Prisma__EmpresaEmpleadoraClient<$Result.GetResult<Prisma.$EmpresaEmpleadoraPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one EmpresaEmpleadora.
     * @param {EmpresaEmpleadoraUpdateArgs} args - Arguments to update one EmpresaEmpleadora.
     * @example
     * // Update one EmpresaEmpleadora
     * const empresaEmpleadora = await prisma.empresaEmpleadora.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EmpresaEmpleadoraUpdateArgs>(args: SelectSubset<T, EmpresaEmpleadoraUpdateArgs<ExtArgs>>): Prisma__EmpresaEmpleadoraClient<$Result.GetResult<Prisma.$EmpresaEmpleadoraPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more EmpresaEmpleadoras.
     * @param {EmpresaEmpleadoraDeleteManyArgs} args - Arguments to filter EmpresaEmpleadoras to delete.
     * @example
     * // Delete a few EmpresaEmpleadoras
     * const { count } = await prisma.empresaEmpleadora.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EmpresaEmpleadoraDeleteManyArgs>(args?: SelectSubset<T, EmpresaEmpleadoraDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EmpresaEmpleadoras.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpresaEmpleadoraUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many EmpresaEmpleadoras
     * const empresaEmpleadora = await prisma.empresaEmpleadora.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EmpresaEmpleadoraUpdateManyArgs>(args: SelectSubset<T, EmpresaEmpleadoraUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EmpresaEmpleadoras and returns the data updated in the database.
     * @param {EmpresaEmpleadoraUpdateManyAndReturnArgs} args - Arguments to update many EmpresaEmpleadoras.
     * @example
     * // Update many EmpresaEmpleadoras
     * const empresaEmpleadora = await prisma.empresaEmpleadora.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more EmpresaEmpleadoras and only return the `idEmpresaEmpleadora`
     * const empresaEmpleadoraWithIdEmpresaEmpleadoraOnly = await prisma.empresaEmpleadora.updateManyAndReturn({
     *   select: { idEmpresaEmpleadora: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends EmpresaEmpleadoraUpdateManyAndReturnArgs>(args: SelectSubset<T, EmpresaEmpleadoraUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmpresaEmpleadoraPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one EmpresaEmpleadora.
     * @param {EmpresaEmpleadoraUpsertArgs} args - Arguments to update or create a EmpresaEmpleadora.
     * @example
     * // Update or create a EmpresaEmpleadora
     * const empresaEmpleadora = await prisma.empresaEmpleadora.upsert({
     *   create: {
     *     // ... data to create a EmpresaEmpleadora
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the EmpresaEmpleadora we want to update
     *   }
     * })
     */
    upsert<T extends EmpresaEmpleadoraUpsertArgs>(args: SelectSubset<T, EmpresaEmpleadoraUpsertArgs<ExtArgs>>): Prisma__EmpresaEmpleadoraClient<$Result.GetResult<Prisma.$EmpresaEmpleadoraPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of EmpresaEmpleadoras.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpresaEmpleadoraCountArgs} args - Arguments to filter EmpresaEmpleadoras to count.
     * @example
     * // Count the number of EmpresaEmpleadoras
     * const count = await prisma.empresaEmpleadora.count({
     *   where: {
     *     // ... the filter for the EmpresaEmpleadoras we want to count
     *   }
     * })
    **/
    count<T extends EmpresaEmpleadoraCountArgs>(
      args?: Subset<T, EmpresaEmpleadoraCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EmpresaEmpleadoraCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a EmpresaEmpleadora.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpresaEmpleadoraAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EmpresaEmpleadoraAggregateArgs>(args: Subset<T, EmpresaEmpleadoraAggregateArgs>): Prisma.PrismaPromise<GetEmpresaEmpleadoraAggregateType<T>>

    /**
     * Group by EmpresaEmpleadora.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpresaEmpleadoraGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EmpresaEmpleadoraGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EmpresaEmpleadoraGroupByArgs['orderBy'] }
        : { orderBy?: EmpresaEmpleadoraGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EmpresaEmpleadoraGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEmpresaEmpleadoraGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the EmpresaEmpleadora model
   */
  readonly fields: EmpresaEmpleadoraFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for EmpresaEmpleadora.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EmpresaEmpleadoraClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    equipoEmpleadora<T extends EmpresaEmpleadora$equipoEmpleadoraArgs<ExtArgs> = {}>(args?: Subset<T, EmpresaEmpleadora$equipoEmpleadoraArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EquipoEmpleadoraPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    puestoEmpleadora<T extends EmpresaEmpleadora$puestoEmpleadoraArgs<ExtArgs> = {}>(args?: Subset<T, EmpresaEmpleadora$puestoEmpleadoraArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PuestoEmpleadoraPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    unidadEmpleadora<T extends EmpresaEmpleadora$unidadEmpleadoraArgs<ExtArgs> = {}>(args?: Subset<T, EmpresaEmpleadora$unidadEmpleadoraArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UnidadEmpleadoraPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    objetivo<T extends EmpresaEmpleadora$objetivoArgs<ExtArgs> = {}>(args?: Subset<T, EmpresaEmpleadora$objetivoArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ObjetivoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    empleado<T extends EmpresaEmpleadora$empleadoArgs<ExtArgs> = {}>(args?: Subset<T, EmpresaEmpleadora$empleadoArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the EmpresaEmpleadora model
   */
  interface EmpresaEmpleadoraFieldRefs {
    readonly idEmpresaEmpleadora: FieldRef<"EmpresaEmpleadora", 'Int'>
    readonly nombreEmpresa: FieldRef<"EmpresaEmpleadora", 'String'>
    readonly ruc: FieldRef<"EmpresaEmpleadora", 'String'>
    readonly direccionEmpresa: FieldRef<"EmpresaEmpleadora", 'String'>
    readonly urlLogo: FieldRef<"EmpresaEmpleadora", 'String'>
    readonly fechaVigenciaInicio: FieldRef<"EmpresaEmpleadora", 'DateTime'>
    readonly fechaVigenciaFin: FieldRef<"EmpresaEmpleadora", 'DateTime'>
    readonly estado: FieldRef<"EmpresaEmpleadora", 'Boolean'>
    readonly creadoPorId: FieldRef<"EmpresaEmpleadora", 'Int'>
    readonly actualizadoPorId: FieldRef<"EmpresaEmpleadora", 'Int'>
    readonly fechaCreacion: FieldRef<"EmpresaEmpleadora", 'DateTime'>
    readonly fechaModificacion: FieldRef<"EmpresaEmpleadora", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * EmpresaEmpleadora findUnique
   */
  export type EmpresaEmpleadoraFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmpresaEmpleadora
     */
    select?: EmpresaEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmpresaEmpleadora
     */
    omit?: EmpresaEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpresaEmpleadoraInclude<ExtArgs> | null
    /**
     * Filter, which EmpresaEmpleadora to fetch.
     */
    where: EmpresaEmpleadoraWhereUniqueInput
  }

  /**
   * EmpresaEmpleadora findUniqueOrThrow
   */
  export type EmpresaEmpleadoraFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmpresaEmpleadora
     */
    select?: EmpresaEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmpresaEmpleadora
     */
    omit?: EmpresaEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpresaEmpleadoraInclude<ExtArgs> | null
    /**
     * Filter, which EmpresaEmpleadora to fetch.
     */
    where: EmpresaEmpleadoraWhereUniqueInput
  }

  /**
   * EmpresaEmpleadora findFirst
   */
  export type EmpresaEmpleadoraFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmpresaEmpleadora
     */
    select?: EmpresaEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmpresaEmpleadora
     */
    omit?: EmpresaEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpresaEmpleadoraInclude<ExtArgs> | null
    /**
     * Filter, which EmpresaEmpleadora to fetch.
     */
    where?: EmpresaEmpleadoraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmpresaEmpleadoras to fetch.
     */
    orderBy?: EmpresaEmpleadoraOrderByWithRelationInput | EmpresaEmpleadoraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EmpresaEmpleadoras.
     */
    cursor?: EmpresaEmpleadoraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmpresaEmpleadoras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmpresaEmpleadoras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EmpresaEmpleadoras.
     */
    distinct?: EmpresaEmpleadoraScalarFieldEnum | EmpresaEmpleadoraScalarFieldEnum[]
  }

  /**
   * EmpresaEmpleadora findFirstOrThrow
   */
  export type EmpresaEmpleadoraFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmpresaEmpleadora
     */
    select?: EmpresaEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmpresaEmpleadora
     */
    omit?: EmpresaEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpresaEmpleadoraInclude<ExtArgs> | null
    /**
     * Filter, which EmpresaEmpleadora to fetch.
     */
    where?: EmpresaEmpleadoraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmpresaEmpleadoras to fetch.
     */
    orderBy?: EmpresaEmpleadoraOrderByWithRelationInput | EmpresaEmpleadoraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EmpresaEmpleadoras.
     */
    cursor?: EmpresaEmpleadoraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmpresaEmpleadoras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmpresaEmpleadoras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EmpresaEmpleadoras.
     */
    distinct?: EmpresaEmpleadoraScalarFieldEnum | EmpresaEmpleadoraScalarFieldEnum[]
  }

  /**
   * EmpresaEmpleadora findMany
   */
  export type EmpresaEmpleadoraFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmpresaEmpleadora
     */
    select?: EmpresaEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmpresaEmpleadora
     */
    omit?: EmpresaEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpresaEmpleadoraInclude<ExtArgs> | null
    /**
     * Filter, which EmpresaEmpleadoras to fetch.
     */
    where?: EmpresaEmpleadoraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmpresaEmpleadoras to fetch.
     */
    orderBy?: EmpresaEmpleadoraOrderByWithRelationInput | EmpresaEmpleadoraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing EmpresaEmpleadoras.
     */
    cursor?: EmpresaEmpleadoraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmpresaEmpleadoras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmpresaEmpleadoras.
     */
    skip?: number
    distinct?: EmpresaEmpleadoraScalarFieldEnum | EmpresaEmpleadoraScalarFieldEnum[]
  }

  /**
   * EmpresaEmpleadora create
   */
  export type EmpresaEmpleadoraCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmpresaEmpleadora
     */
    select?: EmpresaEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmpresaEmpleadora
     */
    omit?: EmpresaEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpresaEmpleadoraInclude<ExtArgs> | null
    /**
     * The data needed to create a EmpresaEmpleadora.
     */
    data: XOR<EmpresaEmpleadoraCreateInput, EmpresaEmpleadoraUncheckedCreateInput>
  }

  /**
   * EmpresaEmpleadora createMany
   */
  export type EmpresaEmpleadoraCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many EmpresaEmpleadoras.
     */
    data: EmpresaEmpleadoraCreateManyInput | EmpresaEmpleadoraCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * EmpresaEmpleadora createManyAndReturn
   */
  export type EmpresaEmpleadoraCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmpresaEmpleadora
     */
    select?: EmpresaEmpleadoraSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the EmpresaEmpleadora
     */
    omit?: EmpresaEmpleadoraOmit<ExtArgs> | null
    /**
     * The data used to create many EmpresaEmpleadoras.
     */
    data: EmpresaEmpleadoraCreateManyInput | EmpresaEmpleadoraCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * EmpresaEmpleadora update
   */
  export type EmpresaEmpleadoraUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmpresaEmpleadora
     */
    select?: EmpresaEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmpresaEmpleadora
     */
    omit?: EmpresaEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpresaEmpleadoraInclude<ExtArgs> | null
    /**
     * The data needed to update a EmpresaEmpleadora.
     */
    data: XOR<EmpresaEmpleadoraUpdateInput, EmpresaEmpleadoraUncheckedUpdateInput>
    /**
     * Choose, which EmpresaEmpleadora to update.
     */
    where: EmpresaEmpleadoraWhereUniqueInput
  }

  /**
   * EmpresaEmpleadora updateMany
   */
  export type EmpresaEmpleadoraUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update EmpresaEmpleadoras.
     */
    data: XOR<EmpresaEmpleadoraUpdateManyMutationInput, EmpresaEmpleadoraUncheckedUpdateManyInput>
    /**
     * Filter which EmpresaEmpleadoras to update
     */
    where?: EmpresaEmpleadoraWhereInput
    /**
     * Limit how many EmpresaEmpleadoras to update.
     */
    limit?: number
  }

  /**
   * EmpresaEmpleadora updateManyAndReturn
   */
  export type EmpresaEmpleadoraUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmpresaEmpleadora
     */
    select?: EmpresaEmpleadoraSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the EmpresaEmpleadora
     */
    omit?: EmpresaEmpleadoraOmit<ExtArgs> | null
    /**
     * The data used to update EmpresaEmpleadoras.
     */
    data: XOR<EmpresaEmpleadoraUpdateManyMutationInput, EmpresaEmpleadoraUncheckedUpdateManyInput>
    /**
     * Filter which EmpresaEmpleadoras to update
     */
    where?: EmpresaEmpleadoraWhereInput
    /**
     * Limit how many EmpresaEmpleadoras to update.
     */
    limit?: number
  }

  /**
   * EmpresaEmpleadora upsert
   */
  export type EmpresaEmpleadoraUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmpresaEmpleadora
     */
    select?: EmpresaEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmpresaEmpleadora
     */
    omit?: EmpresaEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpresaEmpleadoraInclude<ExtArgs> | null
    /**
     * The filter to search for the EmpresaEmpleadora to update in case it exists.
     */
    where: EmpresaEmpleadoraWhereUniqueInput
    /**
     * In case the EmpresaEmpleadora found by the `where` argument doesn't exist, create a new EmpresaEmpleadora with this data.
     */
    create: XOR<EmpresaEmpleadoraCreateInput, EmpresaEmpleadoraUncheckedCreateInput>
    /**
     * In case the EmpresaEmpleadora was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EmpresaEmpleadoraUpdateInput, EmpresaEmpleadoraUncheckedUpdateInput>
  }

  /**
   * EmpresaEmpleadora delete
   */
  export type EmpresaEmpleadoraDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmpresaEmpleadora
     */
    select?: EmpresaEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmpresaEmpleadora
     */
    omit?: EmpresaEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpresaEmpleadoraInclude<ExtArgs> | null
    /**
     * Filter which EmpresaEmpleadora to delete.
     */
    where: EmpresaEmpleadoraWhereUniqueInput
  }

  /**
   * EmpresaEmpleadora deleteMany
   */
  export type EmpresaEmpleadoraDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EmpresaEmpleadoras to delete
     */
    where?: EmpresaEmpleadoraWhereInput
    /**
     * Limit how many EmpresaEmpleadoras to delete.
     */
    limit?: number
  }

  /**
   * EmpresaEmpleadora.equipoEmpleadora
   */
  export type EmpresaEmpleadora$equipoEmpleadoraArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EquipoEmpleadora
     */
    select?: EquipoEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EquipoEmpleadora
     */
    omit?: EquipoEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EquipoEmpleadoraInclude<ExtArgs> | null
    where?: EquipoEmpleadoraWhereInput
    orderBy?: EquipoEmpleadoraOrderByWithRelationInput | EquipoEmpleadoraOrderByWithRelationInput[]
    cursor?: EquipoEmpleadoraWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EquipoEmpleadoraScalarFieldEnum | EquipoEmpleadoraScalarFieldEnum[]
  }

  /**
   * EmpresaEmpleadora.puestoEmpleadora
   */
  export type EmpresaEmpleadora$puestoEmpleadoraArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PuestoEmpleadora
     */
    select?: PuestoEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PuestoEmpleadora
     */
    omit?: PuestoEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PuestoEmpleadoraInclude<ExtArgs> | null
    where?: PuestoEmpleadoraWhereInput
    orderBy?: PuestoEmpleadoraOrderByWithRelationInput | PuestoEmpleadoraOrderByWithRelationInput[]
    cursor?: PuestoEmpleadoraWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PuestoEmpleadoraScalarFieldEnum | PuestoEmpleadoraScalarFieldEnum[]
  }

  /**
   * EmpresaEmpleadora.unidadEmpleadora
   */
  export type EmpresaEmpleadora$unidadEmpleadoraArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnidadEmpleadora
     */
    select?: UnidadEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnidadEmpleadora
     */
    omit?: UnidadEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnidadEmpleadoraInclude<ExtArgs> | null
    where?: UnidadEmpleadoraWhereInput
    orderBy?: UnidadEmpleadoraOrderByWithRelationInput | UnidadEmpleadoraOrderByWithRelationInput[]
    cursor?: UnidadEmpleadoraWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UnidadEmpleadoraScalarFieldEnum | UnidadEmpleadoraScalarFieldEnum[]
  }

  /**
   * EmpresaEmpleadora.objetivo
   */
  export type EmpresaEmpleadora$objetivoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoInclude<ExtArgs> | null
    where?: ObjetivoWhereInput
    orderBy?: ObjetivoOrderByWithRelationInput | ObjetivoOrderByWithRelationInput[]
    cursor?: ObjetivoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ObjetivoScalarFieldEnum | ObjetivoScalarFieldEnum[]
  }

  /**
   * EmpresaEmpleadora.empleado
   */
  export type EmpresaEmpleadora$empleadoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Empleado
     */
    omit?: EmpleadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoInclude<ExtArgs> | null
    where?: EmpleadoWhereInput
    orderBy?: EmpleadoOrderByWithRelationInput | EmpleadoOrderByWithRelationInput[]
    cursor?: EmpleadoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EmpleadoScalarFieldEnum | EmpleadoScalarFieldEnum[]
  }

  /**
   * EmpresaEmpleadora without action
   */
  export type EmpresaEmpleadoraDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmpresaEmpleadora
     */
    select?: EmpresaEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmpresaEmpleadora
     */
    omit?: EmpresaEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpresaEmpleadoraInclude<ExtArgs> | null
  }


  /**
   * Model EquipoEmpleadora
   */

  export type AggregateEquipoEmpleadora = {
    _count: EquipoEmpleadoraCountAggregateOutputType | null
    _avg: EquipoEmpleadoraAvgAggregateOutputType | null
    _sum: EquipoEmpleadoraSumAggregateOutputType | null
    _min: EquipoEmpleadoraMinAggregateOutputType | null
    _max: EquipoEmpleadoraMaxAggregateOutputType | null
  }

  export type EquipoEmpleadoraAvgAggregateOutputType = {
    idEquipoEmpleadora: number | null
    idEmpresaEmpleadora: number | null
    creadoPorId: number | null
    actualizadoPorId: number | null
  }

  export type EquipoEmpleadoraSumAggregateOutputType = {
    idEquipoEmpleadora: number | null
    idEmpresaEmpleadora: number | null
    creadoPorId: number | null
    actualizadoPorId: number | null
  }

  export type EquipoEmpleadoraMinAggregateOutputType = {
    idEquipoEmpleadora: number | null
    descripcion: string | null
    idEmpresaEmpleadora: number | null
    estado: boolean | null
    creadoPorId: number | null
    actualizadoPorId: number | null
    fechaCreacion: Date | null
    fechaModificacion: Date | null
  }

  export type EquipoEmpleadoraMaxAggregateOutputType = {
    idEquipoEmpleadora: number | null
    descripcion: string | null
    idEmpresaEmpleadora: number | null
    estado: boolean | null
    creadoPorId: number | null
    actualizadoPorId: number | null
    fechaCreacion: Date | null
    fechaModificacion: Date | null
  }

  export type EquipoEmpleadoraCountAggregateOutputType = {
    idEquipoEmpleadora: number
    descripcion: number
    idEmpresaEmpleadora: number
    estado: number
    creadoPorId: number
    actualizadoPorId: number
    fechaCreacion: number
    fechaModificacion: number
    _all: number
  }


  export type EquipoEmpleadoraAvgAggregateInputType = {
    idEquipoEmpleadora?: true
    idEmpresaEmpleadora?: true
    creadoPorId?: true
    actualizadoPorId?: true
  }

  export type EquipoEmpleadoraSumAggregateInputType = {
    idEquipoEmpleadora?: true
    idEmpresaEmpleadora?: true
    creadoPorId?: true
    actualizadoPorId?: true
  }

  export type EquipoEmpleadoraMinAggregateInputType = {
    idEquipoEmpleadora?: true
    descripcion?: true
    idEmpresaEmpleadora?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
  }

  export type EquipoEmpleadoraMaxAggregateInputType = {
    idEquipoEmpleadora?: true
    descripcion?: true
    idEmpresaEmpleadora?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
  }

  export type EquipoEmpleadoraCountAggregateInputType = {
    idEquipoEmpleadora?: true
    descripcion?: true
    idEmpresaEmpleadora?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
    _all?: true
  }

  export type EquipoEmpleadoraAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EquipoEmpleadora to aggregate.
     */
    where?: EquipoEmpleadoraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EquipoEmpleadoras to fetch.
     */
    orderBy?: EquipoEmpleadoraOrderByWithRelationInput | EquipoEmpleadoraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EquipoEmpleadoraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EquipoEmpleadoras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EquipoEmpleadoras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned EquipoEmpleadoras
    **/
    _count?: true | EquipoEmpleadoraCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EquipoEmpleadoraAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EquipoEmpleadoraSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EquipoEmpleadoraMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EquipoEmpleadoraMaxAggregateInputType
  }

  export type GetEquipoEmpleadoraAggregateType<T extends EquipoEmpleadoraAggregateArgs> = {
        [P in keyof T & keyof AggregateEquipoEmpleadora]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEquipoEmpleadora[P]>
      : GetScalarType<T[P], AggregateEquipoEmpleadora[P]>
  }




  export type EquipoEmpleadoraGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EquipoEmpleadoraWhereInput
    orderBy?: EquipoEmpleadoraOrderByWithAggregationInput | EquipoEmpleadoraOrderByWithAggregationInput[]
    by: EquipoEmpleadoraScalarFieldEnum[] | EquipoEmpleadoraScalarFieldEnum
    having?: EquipoEmpleadoraScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EquipoEmpleadoraCountAggregateInputType | true
    _avg?: EquipoEmpleadoraAvgAggregateInputType
    _sum?: EquipoEmpleadoraSumAggregateInputType
    _min?: EquipoEmpleadoraMinAggregateInputType
    _max?: EquipoEmpleadoraMaxAggregateInputType
  }

  export type EquipoEmpleadoraGroupByOutputType = {
    idEquipoEmpleadora: number
    descripcion: string
    idEmpresaEmpleadora: number
    estado: boolean
    creadoPorId: number
    actualizadoPorId: number | null
    fechaCreacion: Date
    fechaModificacion: Date | null
    _count: EquipoEmpleadoraCountAggregateOutputType | null
    _avg: EquipoEmpleadoraAvgAggregateOutputType | null
    _sum: EquipoEmpleadoraSumAggregateOutputType | null
    _min: EquipoEmpleadoraMinAggregateOutputType | null
    _max: EquipoEmpleadoraMaxAggregateOutputType | null
  }

  type GetEquipoEmpleadoraGroupByPayload<T extends EquipoEmpleadoraGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EquipoEmpleadoraGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EquipoEmpleadoraGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EquipoEmpleadoraGroupByOutputType[P]>
            : GetScalarType<T[P], EquipoEmpleadoraGroupByOutputType[P]>
        }
      >
    >


  export type EquipoEmpleadoraSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idEquipoEmpleadora?: boolean
    descripcion?: boolean
    idEmpresaEmpleadora?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
    Empleado?: boolean | EquipoEmpleadora$EmpleadoArgs<ExtArgs>
    _count?: boolean | EquipoEmpleadoraCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["equipoEmpleadora"]>

  export type EquipoEmpleadoraSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idEquipoEmpleadora?: boolean
    descripcion?: boolean
    idEmpresaEmpleadora?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["equipoEmpleadora"]>

  export type EquipoEmpleadoraSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idEquipoEmpleadora?: boolean
    descripcion?: boolean
    idEmpresaEmpleadora?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["equipoEmpleadora"]>

  export type EquipoEmpleadoraSelectScalar = {
    idEquipoEmpleadora?: boolean
    descripcion?: boolean
    idEmpresaEmpleadora?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
  }

  export type EquipoEmpleadoraOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"idEquipoEmpleadora" | "descripcion" | "idEmpresaEmpleadora" | "estado" | "creadoPorId" | "actualizadoPorId" | "fechaCreacion" | "fechaModificacion", ExtArgs["result"]["equipoEmpleadora"]>
  export type EquipoEmpleadoraInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
    Empleado?: boolean | EquipoEmpleadora$EmpleadoArgs<ExtArgs>
    _count?: boolean | EquipoEmpleadoraCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type EquipoEmpleadoraIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
  }
  export type EquipoEmpleadoraIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
  }

  export type $EquipoEmpleadoraPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "EquipoEmpleadora"
    objects: {
      empresaEmpleadora: Prisma.$EmpresaEmpleadoraPayload<ExtArgs>
      Empleado: Prisma.$EmpleadoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      idEquipoEmpleadora: number
      descripcion: string
      idEmpresaEmpleadora: number
      estado: boolean
      creadoPorId: number
      actualizadoPorId: number | null
      fechaCreacion: Date
      fechaModificacion: Date | null
    }, ExtArgs["result"]["equipoEmpleadora"]>
    composites: {}
  }

  type EquipoEmpleadoraGetPayload<S extends boolean | null | undefined | EquipoEmpleadoraDefaultArgs> = $Result.GetResult<Prisma.$EquipoEmpleadoraPayload, S>

  type EquipoEmpleadoraCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<EquipoEmpleadoraFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: EquipoEmpleadoraCountAggregateInputType | true
    }

  export interface EquipoEmpleadoraDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['EquipoEmpleadora'], meta: { name: 'EquipoEmpleadora' } }
    /**
     * Find zero or one EquipoEmpleadora that matches the filter.
     * @param {EquipoEmpleadoraFindUniqueArgs} args - Arguments to find a EquipoEmpleadora
     * @example
     * // Get one EquipoEmpleadora
     * const equipoEmpleadora = await prisma.equipoEmpleadora.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EquipoEmpleadoraFindUniqueArgs>(args: SelectSubset<T, EquipoEmpleadoraFindUniqueArgs<ExtArgs>>): Prisma__EquipoEmpleadoraClient<$Result.GetResult<Prisma.$EquipoEmpleadoraPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one EquipoEmpleadora that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {EquipoEmpleadoraFindUniqueOrThrowArgs} args - Arguments to find a EquipoEmpleadora
     * @example
     * // Get one EquipoEmpleadora
     * const equipoEmpleadora = await prisma.equipoEmpleadora.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EquipoEmpleadoraFindUniqueOrThrowArgs>(args: SelectSubset<T, EquipoEmpleadoraFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EquipoEmpleadoraClient<$Result.GetResult<Prisma.$EquipoEmpleadoraPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first EquipoEmpleadora that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EquipoEmpleadoraFindFirstArgs} args - Arguments to find a EquipoEmpleadora
     * @example
     * // Get one EquipoEmpleadora
     * const equipoEmpleadora = await prisma.equipoEmpleadora.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EquipoEmpleadoraFindFirstArgs>(args?: SelectSubset<T, EquipoEmpleadoraFindFirstArgs<ExtArgs>>): Prisma__EquipoEmpleadoraClient<$Result.GetResult<Prisma.$EquipoEmpleadoraPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first EquipoEmpleadora that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EquipoEmpleadoraFindFirstOrThrowArgs} args - Arguments to find a EquipoEmpleadora
     * @example
     * // Get one EquipoEmpleadora
     * const equipoEmpleadora = await prisma.equipoEmpleadora.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EquipoEmpleadoraFindFirstOrThrowArgs>(args?: SelectSubset<T, EquipoEmpleadoraFindFirstOrThrowArgs<ExtArgs>>): Prisma__EquipoEmpleadoraClient<$Result.GetResult<Prisma.$EquipoEmpleadoraPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more EquipoEmpleadoras that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EquipoEmpleadoraFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all EquipoEmpleadoras
     * const equipoEmpleadoras = await prisma.equipoEmpleadora.findMany()
     * 
     * // Get first 10 EquipoEmpleadoras
     * const equipoEmpleadoras = await prisma.equipoEmpleadora.findMany({ take: 10 })
     * 
     * // Only select the `idEquipoEmpleadora`
     * const equipoEmpleadoraWithIdEquipoEmpleadoraOnly = await prisma.equipoEmpleadora.findMany({ select: { idEquipoEmpleadora: true } })
     * 
     */
    findMany<T extends EquipoEmpleadoraFindManyArgs>(args?: SelectSubset<T, EquipoEmpleadoraFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EquipoEmpleadoraPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a EquipoEmpleadora.
     * @param {EquipoEmpleadoraCreateArgs} args - Arguments to create a EquipoEmpleadora.
     * @example
     * // Create one EquipoEmpleadora
     * const EquipoEmpleadora = await prisma.equipoEmpleadora.create({
     *   data: {
     *     // ... data to create a EquipoEmpleadora
     *   }
     * })
     * 
     */
    create<T extends EquipoEmpleadoraCreateArgs>(args: SelectSubset<T, EquipoEmpleadoraCreateArgs<ExtArgs>>): Prisma__EquipoEmpleadoraClient<$Result.GetResult<Prisma.$EquipoEmpleadoraPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many EquipoEmpleadoras.
     * @param {EquipoEmpleadoraCreateManyArgs} args - Arguments to create many EquipoEmpleadoras.
     * @example
     * // Create many EquipoEmpleadoras
     * const equipoEmpleadora = await prisma.equipoEmpleadora.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EquipoEmpleadoraCreateManyArgs>(args?: SelectSubset<T, EquipoEmpleadoraCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many EquipoEmpleadoras and returns the data saved in the database.
     * @param {EquipoEmpleadoraCreateManyAndReturnArgs} args - Arguments to create many EquipoEmpleadoras.
     * @example
     * // Create many EquipoEmpleadoras
     * const equipoEmpleadora = await prisma.equipoEmpleadora.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many EquipoEmpleadoras and only return the `idEquipoEmpleadora`
     * const equipoEmpleadoraWithIdEquipoEmpleadoraOnly = await prisma.equipoEmpleadora.createManyAndReturn({
     *   select: { idEquipoEmpleadora: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EquipoEmpleadoraCreateManyAndReturnArgs>(args?: SelectSubset<T, EquipoEmpleadoraCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EquipoEmpleadoraPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a EquipoEmpleadora.
     * @param {EquipoEmpleadoraDeleteArgs} args - Arguments to delete one EquipoEmpleadora.
     * @example
     * // Delete one EquipoEmpleadora
     * const EquipoEmpleadora = await prisma.equipoEmpleadora.delete({
     *   where: {
     *     // ... filter to delete one EquipoEmpleadora
     *   }
     * })
     * 
     */
    delete<T extends EquipoEmpleadoraDeleteArgs>(args: SelectSubset<T, EquipoEmpleadoraDeleteArgs<ExtArgs>>): Prisma__EquipoEmpleadoraClient<$Result.GetResult<Prisma.$EquipoEmpleadoraPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one EquipoEmpleadora.
     * @param {EquipoEmpleadoraUpdateArgs} args - Arguments to update one EquipoEmpleadora.
     * @example
     * // Update one EquipoEmpleadora
     * const equipoEmpleadora = await prisma.equipoEmpleadora.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EquipoEmpleadoraUpdateArgs>(args: SelectSubset<T, EquipoEmpleadoraUpdateArgs<ExtArgs>>): Prisma__EquipoEmpleadoraClient<$Result.GetResult<Prisma.$EquipoEmpleadoraPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more EquipoEmpleadoras.
     * @param {EquipoEmpleadoraDeleteManyArgs} args - Arguments to filter EquipoEmpleadoras to delete.
     * @example
     * // Delete a few EquipoEmpleadoras
     * const { count } = await prisma.equipoEmpleadora.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EquipoEmpleadoraDeleteManyArgs>(args?: SelectSubset<T, EquipoEmpleadoraDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EquipoEmpleadoras.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EquipoEmpleadoraUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many EquipoEmpleadoras
     * const equipoEmpleadora = await prisma.equipoEmpleadora.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EquipoEmpleadoraUpdateManyArgs>(args: SelectSubset<T, EquipoEmpleadoraUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EquipoEmpleadoras and returns the data updated in the database.
     * @param {EquipoEmpleadoraUpdateManyAndReturnArgs} args - Arguments to update many EquipoEmpleadoras.
     * @example
     * // Update many EquipoEmpleadoras
     * const equipoEmpleadora = await prisma.equipoEmpleadora.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more EquipoEmpleadoras and only return the `idEquipoEmpleadora`
     * const equipoEmpleadoraWithIdEquipoEmpleadoraOnly = await prisma.equipoEmpleadora.updateManyAndReturn({
     *   select: { idEquipoEmpleadora: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends EquipoEmpleadoraUpdateManyAndReturnArgs>(args: SelectSubset<T, EquipoEmpleadoraUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EquipoEmpleadoraPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one EquipoEmpleadora.
     * @param {EquipoEmpleadoraUpsertArgs} args - Arguments to update or create a EquipoEmpleadora.
     * @example
     * // Update or create a EquipoEmpleadora
     * const equipoEmpleadora = await prisma.equipoEmpleadora.upsert({
     *   create: {
     *     // ... data to create a EquipoEmpleadora
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the EquipoEmpleadora we want to update
     *   }
     * })
     */
    upsert<T extends EquipoEmpleadoraUpsertArgs>(args: SelectSubset<T, EquipoEmpleadoraUpsertArgs<ExtArgs>>): Prisma__EquipoEmpleadoraClient<$Result.GetResult<Prisma.$EquipoEmpleadoraPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of EquipoEmpleadoras.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EquipoEmpleadoraCountArgs} args - Arguments to filter EquipoEmpleadoras to count.
     * @example
     * // Count the number of EquipoEmpleadoras
     * const count = await prisma.equipoEmpleadora.count({
     *   where: {
     *     // ... the filter for the EquipoEmpleadoras we want to count
     *   }
     * })
    **/
    count<T extends EquipoEmpleadoraCountArgs>(
      args?: Subset<T, EquipoEmpleadoraCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EquipoEmpleadoraCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a EquipoEmpleadora.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EquipoEmpleadoraAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EquipoEmpleadoraAggregateArgs>(args: Subset<T, EquipoEmpleadoraAggregateArgs>): Prisma.PrismaPromise<GetEquipoEmpleadoraAggregateType<T>>

    /**
     * Group by EquipoEmpleadora.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EquipoEmpleadoraGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EquipoEmpleadoraGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EquipoEmpleadoraGroupByArgs['orderBy'] }
        : { orderBy?: EquipoEmpleadoraGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EquipoEmpleadoraGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEquipoEmpleadoraGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the EquipoEmpleadora model
   */
  readonly fields: EquipoEmpleadoraFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for EquipoEmpleadora.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EquipoEmpleadoraClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    empresaEmpleadora<T extends EmpresaEmpleadoraDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EmpresaEmpleadoraDefaultArgs<ExtArgs>>): Prisma__EmpresaEmpleadoraClient<$Result.GetResult<Prisma.$EmpresaEmpleadoraPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    Empleado<T extends EquipoEmpleadora$EmpleadoArgs<ExtArgs> = {}>(args?: Subset<T, EquipoEmpleadora$EmpleadoArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the EquipoEmpleadora model
   */
  interface EquipoEmpleadoraFieldRefs {
    readonly idEquipoEmpleadora: FieldRef<"EquipoEmpleadora", 'Int'>
    readonly descripcion: FieldRef<"EquipoEmpleadora", 'String'>
    readonly idEmpresaEmpleadora: FieldRef<"EquipoEmpleadora", 'Int'>
    readonly estado: FieldRef<"EquipoEmpleadora", 'Boolean'>
    readonly creadoPorId: FieldRef<"EquipoEmpleadora", 'Int'>
    readonly actualizadoPorId: FieldRef<"EquipoEmpleadora", 'Int'>
    readonly fechaCreacion: FieldRef<"EquipoEmpleadora", 'DateTime'>
    readonly fechaModificacion: FieldRef<"EquipoEmpleadora", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * EquipoEmpleadora findUnique
   */
  export type EquipoEmpleadoraFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EquipoEmpleadora
     */
    select?: EquipoEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EquipoEmpleadora
     */
    omit?: EquipoEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EquipoEmpleadoraInclude<ExtArgs> | null
    /**
     * Filter, which EquipoEmpleadora to fetch.
     */
    where: EquipoEmpleadoraWhereUniqueInput
  }

  /**
   * EquipoEmpleadora findUniqueOrThrow
   */
  export type EquipoEmpleadoraFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EquipoEmpleadora
     */
    select?: EquipoEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EquipoEmpleadora
     */
    omit?: EquipoEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EquipoEmpleadoraInclude<ExtArgs> | null
    /**
     * Filter, which EquipoEmpleadora to fetch.
     */
    where: EquipoEmpleadoraWhereUniqueInput
  }

  /**
   * EquipoEmpleadora findFirst
   */
  export type EquipoEmpleadoraFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EquipoEmpleadora
     */
    select?: EquipoEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EquipoEmpleadora
     */
    omit?: EquipoEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EquipoEmpleadoraInclude<ExtArgs> | null
    /**
     * Filter, which EquipoEmpleadora to fetch.
     */
    where?: EquipoEmpleadoraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EquipoEmpleadoras to fetch.
     */
    orderBy?: EquipoEmpleadoraOrderByWithRelationInput | EquipoEmpleadoraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EquipoEmpleadoras.
     */
    cursor?: EquipoEmpleadoraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EquipoEmpleadoras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EquipoEmpleadoras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EquipoEmpleadoras.
     */
    distinct?: EquipoEmpleadoraScalarFieldEnum | EquipoEmpleadoraScalarFieldEnum[]
  }

  /**
   * EquipoEmpleadora findFirstOrThrow
   */
  export type EquipoEmpleadoraFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EquipoEmpleadora
     */
    select?: EquipoEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EquipoEmpleadora
     */
    omit?: EquipoEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EquipoEmpleadoraInclude<ExtArgs> | null
    /**
     * Filter, which EquipoEmpleadora to fetch.
     */
    where?: EquipoEmpleadoraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EquipoEmpleadoras to fetch.
     */
    orderBy?: EquipoEmpleadoraOrderByWithRelationInput | EquipoEmpleadoraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EquipoEmpleadoras.
     */
    cursor?: EquipoEmpleadoraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EquipoEmpleadoras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EquipoEmpleadoras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EquipoEmpleadoras.
     */
    distinct?: EquipoEmpleadoraScalarFieldEnum | EquipoEmpleadoraScalarFieldEnum[]
  }

  /**
   * EquipoEmpleadora findMany
   */
  export type EquipoEmpleadoraFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EquipoEmpleadora
     */
    select?: EquipoEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EquipoEmpleadora
     */
    omit?: EquipoEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EquipoEmpleadoraInclude<ExtArgs> | null
    /**
     * Filter, which EquipoEmpleadoras to fetch.
     */
    where?: EquipoEmpleadoraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EquipoEmpleadoras to fetch.
     */
    orderBy?: EquipoEmpleadoraOrderByWithRelationInput | EquipoEmpleadoraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing EquipoEmpleadoras.
     */
    cursor?: EquipoEmpleadoraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EquipoEmpleadoras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EquipoEmpleadoras.
     */
    skip?: number
    distinct?: EquipoEmpleadoraScalarFieldEnum | EquipoEmpleadoraScalarFieldEnum[]
  }

  /**
   * EquipoEmpleadora create
   */
  export type EquipoEmpleadoraCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EquipoEmpleadora
     */
    select?: EquipoEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EquipoEmpleadora
     */
    omit?: EquipoEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EquipoEmpleadoraInclude<ExtArgs> | null
    /**
     * The data needed to create a EquipoEmpleadora.
     */
    data: XOR<EquipoEmpleadoraCreateInput, EquipoEmpleadoraUncheckedCreateInput>
  }

  /**
   * EquipoEmpleadora createMany
   */
  export type EquipoEmpleadoraCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many EquipoEmpleadoras.
     */
    data: EquipoEmpleadoraCreateManyInput | EquipoEmpleadoraCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * EquipoEmpleadora createManyAndReturn
   */
  export type EquipoEmpleadoraCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EquipoEmpleadora
     */
    select?: EquipoEmpleadoraSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the EquipoEmpleadora
     */
    omit?: EquipoEmpleadoraOmit<ExtArgs> | null
    /**
     * The data used to create many EquipoEmpleadoras.
     */
    data: EquipoEmpleadoraCreateManyInput | EquipoEmpleadoraCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EquipoEmpleadoraIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * EquipoEmpleadora update
   */
  export type EquipoEmpleadoraUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EquipoEmpleadora
     */
    select?: EquipoEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EquipoEmpleadora
     */
    omit?: EquipoEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EquipoEmpleadoraInclude<ExtArgs> | null
    /**
     * The data needed to update a EquipoEmpleadora.
     */
    data: XOR<EquipoEmpleadoraUpdateInput, EquipoEmpleadoraUncheckedUpdateInput>
    /**
     * Choose, which EquipoEmpleadora to update.
     */
    where: EquipoEmpleadoraWhereUniqueInput
  }

  /**
   * EquipoEmpleadora updateMany
   */
  export type EquipoEmpleadoraUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update EquipoEmpleadoras.
     */
    data: XOR<EquipoEmpleadoraUpdateManyMutationInput, EquipoEmpleadoraUncheckedUpdateManyInput>
    /**
     * Filter which EquipoEmpleadoras to update
     */
    where?: EquipoEmpleadoraWhereInput
    /**
     * Limit how many EquipoEmpleadoras to update.
     */
    limit?: number
  }

  /**
   * EquipoEmpleadora updateManyAndReturn
   */
  export type EquipoEmpleadoraUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EquipoEmpleadora
     */
    select?: EquipoEmpleadoraSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the EquipoEmpleadora
     */
    omit?: EquipoEmpleadoraOmit<ExtArgs> | null
    /**
     * The data used to update EquipoEmpleadoras.
     */
    data: XOR<EquipoEmpleadoraUpdateManyMutationInput, EquipoEmpleadoraUncheckedUpdateManyInput>
    /**
     * Filter which EquipoEmpleadoras to update
     */
    where?: EquipoEmpleadoraWhereInput
    /**
     * Limit how many EquipoEmpleadoras to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EquipoEmpleadoraIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * EquipoEmpleadora upsert
   */
  export type EquipoEmpleadoraUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EquipoEmpleadora
     */
    select?: EquipoEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EquipoEmpleadora
     */
    omit?: EquipoEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EquipoEmpleadoraInclude<ExtArgs> | null
    /**
     * The filter to search for the EquipoEmpleadora to update in case it exists.
     */
    where: EquipoEmpleadoraWhereUniqueInput
    /**
     * In case the EquipoEmpleadora found by the `where` argument doesn't exist, create a new EquipoEmpleadora with this data.
     */
    create: XOR<EquipoEmpleadoraCreateInput, EquipoEmpleadoraUncheckedCreateInput>
    /**
     * In case the EquipoEmpleadora was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EquipoEmpleadoraUpdateInput, EquipoEmpleadoraUncheckedUpdateInput>
  }

  /**
   * EquipoEmpleadora delete
   */
  export type EquipoEmpleadoraDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EquipoEmpleadora
     */
    select?: EquipoEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EquipoEmpleadora
     */
    omit?: EquipoEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EquipoEmpleadoraInclude<ExtArgs> | null
    /**
     * Filter which EquipoEmpleadora to delete.
     */
    where: EquipoEmpleadoraWhereUniqueInput
  }

  /**
   * EquipoEmpleadora deleteMany
   */
  export type EquipoEmpleadoraDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EquipoEmpleadoras to delete
     */
    where?: EquipoEmpleadoraWhereInput
    /**
     * Limit how many EquipoEmpleadoras to delete.
     */
    limit?: number
  }

  /**
   * EquipoEmpleadora.Empleado
   */
  export type EquipoEmpleadora$EmpleadoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Empleado
     */
    omit?: EmpleadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoInclude<ExtArgs> | null
    where?: EmpleadoWhereInput
    orderBy?: EmpleadoOrderByWithRelationInput | EmpleadoOrderByWithRelationInput[]
    cursor?: EmpleadoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EmpleadoScalarFieldEnum | EmpleadoScalarFieldEnum[]
  }

  /**
   * EquipoEmpleadora without action
   */
  export type EquipoEmpleadoraDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EquipoEmpleadora
     */
    select?: EquipoEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EquipoEmpleadora
     */
    omit?: EquipoEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EquipoEmpleadoraInclude<ExtArgs> | null
  }


  /**
   * Model PuestoEmpleadora
   */

  export type AggregatePuestoEmpleadora = {
    _count: PuestoEmpleadoraCountAggregateOutputType | null
    _avg: PuestoEmpleadoraAvgAggregateOutputType | null
    _sum: PuestoEmpleadoraSumAggregateOutputType | null
    _min: PuestoEmpleadoraMinAggregateOutputType | null
    _max: PuestoEmpleadoraMaxAggregateOutputType | null
  }

  export type PuestoEmpleadoraAvgAggregateOutputType = {
    idPuestoEmpleadora: number | null
    idEmpresaEmpleadora: number | null
    creadoPorId: number | null
    actualizadoPorId: number | null
  }

  export type PuestoEmpleadoraSumAggregateOutputType = {
    idPuestoEmpleadora: number | null
    idEmpresaEmpleadora: number | null
    creadoPorId: number | null
    actualizadoPorId: number | null
  }

  export type PuestoEmpleadoraMinAggregateOutputType = {
    idPuestoEmpleadora: number | null
    descripcion: string | null
    idEmpresaEmpleadora: number | null
    estado: boolean | null
    creadoPorId: number | null
    actualizadoPorId: number | null
    fechaCreacion: Date | null
    fechaModificacion: Date | null
  }

  export type PuestoEmpleadoraMaxAggregateOutputType = {
    idPuestoEmpleadora: number | null
    descripcion: string | null
    idEmpresaEmpleadora: number | null
    estado: boolean | null
    creadoPorId: number | null
    actualizadoPorId: number | null
    fechaCreacion: Date | null
    fechaModificacion: Date | null
  }

  export type PuestoEmpleadoraCountAggregateOutputType = {
    idPuestoEmpleadora: number
    descripcion: number
    idEmpresaEmpleadora: number
    estado: number
    creadoPorId: number
    actualizadoPorId: number
    fechaCreacion: number
    fechaModificacion: number
    _all: number
  }


  export type PuestoEmpleadoraAvgAggregateInputType = {
    idPuestoEmpleadora?: true
    idEmpresaEmpleadora?: true
    creadoPorId?: true
    actualizadoPorId?: true
  }

  export type PuestoEmpleadoraSumAggregateInputType = {
    idPuestoEmpleadora?: true
    idEmpresaEmpleadora?: true
    creadoPorId?: true
    actualizadoPorId?: true
  }

  export type PuestoEmpleadoraMinAggregateInputType = {
    idPuestoEmpleadora?: true
    descripcion?: true
    idEmpresaEmpleadora?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
  }

  export type PuestoEmpleadoraMaxAggregateInputType = {
    idPuestoEmpleadora?: true
    descripcion?: true
    idEmpresaEmpleadora?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
  }

  export type PuestoEmpleadoraCountAggregateInputType = {
    idPuestoEmpleadora?: true
    descripcion?: true
    idEmpresaEmpleadora?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
    _all?: true
  }

  export type PuestoEmpleadoraAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PuestoEmpleadora to aggregate.
     */
    where?: PuestoEmpleadoraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PuestoEmpleadoras to fetch.
     */
    orderBy?: PuestoEmpleadoraOrderByWithRelationInput | PuestoEmpleadoraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PuestoEmpleadoraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PuestoEmpleadoras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PuestoEmpleadoras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PuestoEmpleadoras
    **/
    _count?: true | PuestoEmpleadoraCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PuestoEmpleadoraAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PuestoEmpleadoraSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PuestoEmpleadoraMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PuestoEmpleadoraMaxAggregateInputType
  }

  export type GetPuestoEmpleadoraAggregateType<T extends PuestoEmpleadoraAggregateArgs> = {
        [P in keyof T & keyof AggregatePuestoEmpleadora]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePuestoEmpleadora[P]>
      : GetScalarType<T[P], AggregatePuestoEmpleadora[P]>
  }




  export type PuestoEmpleadoraGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PuestoEmpleadoraWhereInput
    orderBy?: PuestoEmpleadoraOrderByWithAggregationInput | PuestoEmpleadoraOrderByWithAggregationInput[]
    by: PuestoEmpleadoraScalarFieldEnum[] | PuestoEmpleadoraScalarFieldEnum
    having?: PuestoEmpleadoraScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PuestoEmpleadoraCountAggregateInputType | true
    _avg?: PuestoEmpleadoraAvgAggregateInputType
    _sum?: PuestoEmpleadoraSumAggregateInputType
    _min?: PuestoEmpleadoraMinAggregateInputType
    _max?: PuestoEmpleadoraMaxAggregateInputType
  }

  export type PuestoEmpleadoraGroupByOutputType = {
    idPuestoEmpleadora: number
    descripcion: string
    idEmpresaEmpleadora: number
    estado: boolean
    creadoPorId: number
    actualizadoPorId: number | null
    fechaCreacion: Date
    fechaModificacion: Date | null
    _count: PuestoEmpleadoraCountAggregateOutputType | null
    _avg: PuestoEmpleadoraAvgAggregateOutputType | null
    _sum: PuestoEmpleadoraSumAggregateOutputType | null
    _min: PuestoEmpleadoraMinAggregateOutputType | null
    _max: PuestoEmpleadoraMaxAggregateOutputType | null
  }

  type GetPuestoEmpleadoraGroupByPayload<T extends PuestoEmpleadoraGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PuestoEmpleadoraGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PuestoEmpleadoraGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PuestoEmpleadoraGroupByOutputType[P]>
            : GetScalarType<T[P], PuestoEmpleadoraGroupByOutputType[P]>
        }
      >
    >


  export type PuestoEmpleadoraSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idPuestoEmpleadora?: boolean
    descripcion?: boolean
    idEmpresaEmpleadora?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
    Empleado?: boolean | PuestoEmpleadora$EmpleadoArgs<ExtArgs>
    _count?: boolean | PuestoEmpleadoraCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["puestoEmpleadora"]>

  export type PuestoEmpleadoraSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idPuestoEmpleadora?: boolean
    descripcion?: boolean
    idEmpresaEmpleadora?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["puestoEmpleadora"]>

  export type PuestoEmpleadoraSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idPuestoEmpleadora?: boolean
    descripcion?: boolean
    idEmpresaEmpleadora?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["puestoEmpleadora"]>

  export type PuestoEmpleadoraSelectScalar = {
    idPuestoEmpleadora?: boolean
    descripcion?: boolean
    idEmpresaEmpleadora?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
  }

  export type PuestoEmpleadoraOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"idPuestoEmpleadora" | "descripcion" | "idEmpresaEmpleadora" | "estado" | "creadoPorId" | "actualizadoPorId" | "fechaCreacion" | "fechaModificacion", ExtArgs["result"]["puestoEmpleadora"]>
  export type PuestoEmpleadoraInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
    Empleado?: boolean | PuestoEmpleadora$EmpleadoArgs<ExtArgs>
    _count?: boolean | PuestoEmpleadoraCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PuestoEmpleadoraIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
  }
  export type PuestoEmpleadoraIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
  }

  export type $PuestoEmpleadoraPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PuestoEmpleadora"
    objects: {
      empresaEmpleadora: Prisma.$EmpresaEmpleadoraPayload<ExtArgs>
      Empleado: Prisma.$EmpleadoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      idPuestoEmpleadora: number
      descripcion: string
      idEmpresaEmpleadora: number
      estado: boolean
      creadoPorId: number
      actualizadoPorId: number | null
      fechaCreacion: Date
      fechaModificacion: Date | null
    }, ExtArgs["result"]["puestoEmpleadora"]>
    composites: {}
  }

  type PuestoEmpleadoraGetPayload<S extends boolean | null | undefined | PuestoEmpleadoraDefaultArgs> = $Result.GetResult<Prisma.$PuestoEmpleadoraPayload, S>

  type PuestoEmpleadoraCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PuestoEmpleadoraFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PuestoEmpleadoraCountAggregateInputType | true
    }

  export interface PuestoEmpleadoraDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PuestoEmpleadora'], meta: { name: 'PuestoEmpleadora' } }
    /**
     * Find zero or one PuestoEmpleadora that matches the filter.
     * @param {PuestoEmpleadoraFindUniqueArgs} args - Arguments to find a PuestoEmpleadora
     * @example
     * // Get one PuestoEmpleadora
     * const puestoEmpleadora = await prisma.puestoEmpleadora.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PuestoEmpleadoraFindUniqueArgs>(args: SelectSubset<T, PuestoEmpleadoraFindUniqueArgs<ExtArgs>>): Prisma__PuestoEmpleadoraClient<$Result.GetResult<Prisma.$PuestoEmpleadoraPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PuestoEmpleadora that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PuestoEmpleadoraFindUniqueOrThrowArgs} args - Arguments to find a PuestoEmpleadora
     * @example
     * // Get one PuestoEmpleadora
     * const puestoEmpleadora = await prisma.puestoEmpleadora.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PuestoEmpleadoraFindUniqueOrThrowArgs>(args: SelectSubset<T, PuestoEmpleadoraFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PuestoEmpleadoraClient<$Result.GetResult<Prisma.$PuestoEmpleadoraPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PuestoEmpleadora that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PuestoEmpleadoraFindFirstArgs} args - Arguments to find a PuestoEmpleadora
     * @example
     * // Get one PuestoEmpleadora
     * const puestoEmpleadora = await prisma.puestoEmpleadora.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PuestoEmpleadoraFindFirstArgs>(args?: SelectSubset<T, PuestoEmpleadoraFindFirstArgs<ExtArgs>>): Prisma__PuestoEmpleadoraClient<$Result.GetResult<Prisma.$PuestoEmpleadoraPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PuestoEmpleadora that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PuestoEmpleadoraFindFirstOrThrowArgs} args - Arguments to find a PuestoEmpleadora
     * @example
     * // Get one PuestoEmpleadora
     * const puestoEmpleadora = await prisma.puestoEmpleadora.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PuestoEmpleadoraFindFirstOrThrowArgs>(args?: SelectSubset<T, PuestoEmpleadoraFindFirstOrThrowArgs<ExtArgs>>): Prisma__PuestoEmpleadoraClient<$Result.GetResult<Prisma.$PuestoEmpleadoraPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PuestoEmpleadoras that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PuestoEmpleadoraFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PuestoEmpleadoras
     * const puestoEmpleadoras = await prisma.puestoEmpleadora.findMany()
     * 
     * // Get first 10 PuestoEmpleadoras
     * const puestoEmpleadoras = await prisma.puestoEmpleadora.findMany({ take: 10 })
     * 
     * // Only select the `idPuestoEmpleadora`
     * const puestoEmpleadoraWithIdPuestoEmpleadoraOnly = await prisma.puestoEmpleadora.findMany({ select: { idPuestoEmpleadora: true } })
     * 
     */
    findMany<T extends PuestoEmpleadoraFindManyArgs>(args?: SelectSubset<T, PuestoEmpleadoraFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PuestoEmpleadoraPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PuestoEmpleadora.
     * @param {PuestoEmpleadoraCreateArgs} args - Arguments to create a PuestoEmpleadora.
     * @example
     * // Create one PuestoEmpleadora
     * const PuestoEmpleadora = await prisma.puestoEmpleadora.create({
     *   data: {
     *     // ... data to create a PuestoEmpleadora
     *   }
     * })
     * 
     */
    create<T extends PuestoEmpleadoraCreateArgs>(args: SelectSubset<T, PuestoEmpleadoraCreateArgs<ExtArgs>>): Prisma__PuestoEmpleadoraClient<$Result.GetResult<Prisma.$PuestoEmpleadoraPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PuestoEmpleadoras.
     * @param {PuestoEmpleadoraCreateManyArgs} args - Arguments to create many PuestoEmpleadoras.
     * @example
     * // Create many PuestoEmpleadoras
     * const puestoEmpleadora = await prisma.puestoEmpleadora.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PuestoEmpleadoraCreateManyArgs>(args?: SelectSubset<T, PuestoEmpleadoraCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PuestoEmpleadoras and returns the data saved in the database.
     * @param {PuestoEmpleadoraCreateManyAndReturnArgs} args - Arguments to create many PuestoEmpleadoras.
     * @example
     * // Create many PuestoEmpleadoras
     * const puestoEmpleadora = await prisma.puestoEmpleadora.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PuestoEmpleadoras and only return the `idPuestoEmpleadora`
     * const puestoEmpleadoraWithIdPuestoEmpleadoraOnly = await prisma.puestoEmpleadora.createManyAndReturn({
     *   select: { idPuestoEmpleadora: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PuestoEmpleadoraCreateManyAndReturnArgs>(args?: SelectSubset<T, PuestoEmpleadoraCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PuestoEmpleadoraPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PuestoEmpleadora.
     * @param {PuestoEmpleadoraDeleteArgs} args - Arguments to delete one PuestoEmpleadora.
     * @example
     * // Delete one PuestoEmpleadora
     * const PuestoEmpleadora = await prisma.puestoEmpleadora.delete({
     *   where: {
     *     // ... filter to delete one PuestoEmpleadora
     *   }
     * })
     * 
     */
    delete<T extends PuestoEmpleadoraDeleteArgs>(args: SelectSubset<T, PuestoEmpleadoraDeleteArgs<ExtArgs>>): Prisma__PuestoEmpleadoraClient<$Result.GetResult<Prisma.$PuestoEmpleadoraPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PuestoEmpleadora.
     * @param {PuestoEmpleadoraUpdateArgs} args - Arguments to update one PuestoEmpleadora.
     * @example
     * // Update one PuestoEmpleadora
     * const puestoEmpleadora = await prisma.puestoEmpleadora.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PuestoEmpleadoraUpdateArgs>(args: SelectSubset<T, PuestoEmpleadoraUpdateArgs<ExtArgs>>): Prisma__PuestoEmpleadoraClient<$Result.GetResult<Prisma.$PuestoEmpleadoraPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PuestoEmpleadoras.
     * @param {PuestoEmpleadoraDeleteManyArgs} args - Arguments to filter PuestoEmpleadoras to delete.
     * @example
     * // Delete a few PuestoEmpleadoras
     * const { count } = await prisma.puestoEmpleadora.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PuestoEmpleadoraDeleteManyArgs>(args?: SelectSubset<T, PuestoEmpleadoraDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PuestoEmpleadoras.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PuestoEmpleadoraUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PuestoEmpleadoras
     * const puestoEmpleadora = await prisma.puestoEmpleadora.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PuestoEmpleadoraUpdateManyArgs>(args: SelectSubset<T, PuestoEmpleadoraUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PuestoEmpleadoras and returns the data updated in the database.
     * @param {PuestoEmpleadoraUpdateManyAndReturnArgs} args - Arguments to update many PuestoEmpleadoras.
     * @example
     * // Update many PuestoEmpleadoras
     * const puestoEmpleadora = await prisma.puestoEmpleadora.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PuestoEmpleadoras and only return the `idPuestoEmpleadora`
     * const puestoEmpleadoraWithIdPuestoEmpleadoraOnly = await prisma.puestoEmpleadora.updateManyAndReturn({
     *   select: { idPuestoEmpleadora: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PuestoEmpleadoraUpdateManyAndReturnArgs>(args: SelectSubset<T, PuestoEmpleadoraUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PuestoEmpleadoraPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PuestoEmpleadora.
     * @param {PuestoEmpleadoraUpsertArgs} args - Arguments to update or create a PuestoEmpleadora.
     * @example
     * // Update or create a PuestoEmpleadora
     * const puestoEmpleadora = await prisma.puestoEmpleadora.upsert({
     *   create: {
     *     // ... data to create a PuestoEmpleadora
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PuestoEmpleadora we want to update
     *   }
     * })
     */
    upsert<T extends PuestoEmpleadoraUpsertArgs>(args: SelectSubset<T, PuestoEmpleadoraUpsertArgs<ExtArgs>>): Prisma__PuestoEmpleadoraClient<$Result.GetResult<Prisma.$PuestoEmpleadoraPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PuestoEmpleadoras.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PuestoEmpleadoraCountArgs} args - Arguments to filter PuestoEmpleadoras to count.
     * @example
     * // Count the number of PuestoEmpleadoras
     * const count = await prisma.puestoEmpleadora.count({
     *   where: {
     *     // ... the filter for the PuestoEmpleadoras we want to count
     *   }
     * })
    **/
    count<T extends PuestoEmpleadoraCountArgs>(
      args?: Subset<T, PuestoEmpleadoraCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PuestoEmpleadoraCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PuestoEmpleadora.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PuestoEmpleadoraAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PuestoEmpleadoraAggregateArgs>(args: Subset<T, PuestoEmpleadoraAggregateArgs>): Prisma.PrismaPromise<GetPuestoEmpleadoraAggregateType<T>>

    /**
     * Group by PuestoEmpleadora.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PuestoEmpleadoraGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PuestoEmpleadoraGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PuestoEmpleadoraGroupByArgs['orderBy'] }
        : { orderBy?: PuestoEmpleadoraGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PuestoEmpleadoraGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPuestoEmpleadoraGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PuestoEmpleadora model
   */
  readonly fields: PuestoEmpleadoraFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PuestoEmpleadora.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PuestoEmpleadoraClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    empresaEmpleadora<T extends EmpresaEmpleadoraDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EmpresaEmpleadoraDefaultArgs<ExtArgs>>): Prisma__EmpresaEmpleadoraClient<$Result.GetResult<Prisma.$EmpresaEmpleadoraPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    Empleado<T extends PuestoEmpleadora$EmpleadoArgs<ExtArgs> = {}>(args?: Subset<T, PuestoEmpleadora$EmpleadoArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PuestoEmpleadora model
   */
  interface PuestoEmpleadoraFieldRefs {
    readonly idPuestoEmpleadora: FieldRef<"PuestoEmpleadora", 'Int'>
    readonly descripcion: FieldRef<"PuestoEmpleadora", 'String'>
    readonly idEmpresaEmpleadora: FieldRef<"PuestoEmpleadora", 'Int'>
    readonly estado: FieldRef<"PuestoEmpleadora", 'Boolean'>
    readonly creadoPorId: FieldRef<"PuestoEmpleadora", 'Int'>
    readonly actualizadoPorId: FieldRef<"PuestoEmpleadora", 'Int'>
    readonly fechaCreacion: FieldRef<"PuestoEmpleadora", 'DateTime'>
    readonly fechaModificacion: FieldRef<"PuestoEmpleadora", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PuestoEmpleadora findUnique
   */
  export type PuestoEmpleadoraFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PuestoEmpleadora
     */
    select?: PuestoEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PuestoEmpleadora
     */
    omit?: PuestoEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PuestoEmpleadoraInclude<ExtArgs> | null
    /**
     * Filter, which PuestoEmpleadora to fetch.
     */
    where: PuestoEmpleadoraWhereUniqueInput
  }

  /**
   * PuestoEmpleadora findUniqueOrThrow
   */
  export type PuestoEmpleadoraFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PuestoEmpleadora
     */
    select?: PuestoEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PuestoEmpleadora
     */
    omit?: PuestoEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PuestoEmpleadoraInclude<ExtArgs> | null
    /**
     * Filter, which PuestoEmpleadora to fetch.
     */
    where: PuestoEmpleadoraWhereUniqueInput
  }

  /**
   * PuestoEmpleadora findFirst
   */
  export type PuestoEmpleadoraFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PuestoEmpleadora
     */
    select?: PuestoEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PuestoEmpleadora
     */
    omit?: PuestoEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PuestoEmpleadoraInclude<ExtArgs> | null
    /**
     * Filter, which PuestoEmpleadora to fetch.
     */
    where?: PuestoEmpleadoraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PuestoEmpleadoras to fetch.
     */
    orderBy?: PuestoEmpleadoraOrderByWithRelationInput | PuestoEmpleadoraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PuestoEmpleadoras.
     */
    cursor?: PuestoEmpleadoraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PuestoEmpleadoras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PuestoEmpleadoras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PuestoEmpleadoras.
     */
    distinct?: PuestoEmpleadoraScalarFieldEnum | PuestoEmpleadoraScalarFieldEnum[]
  }

  /**
   * PuestoEmpleadora findFirstOrThrow
   */
  export type PuestoEmpleadoraFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PuestoEmpleadora
     */
    select?: PuestoEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PuestoEmpleadora
     */
    omit?: PuestoEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PuestoEmpleadoraInclude<ExtArgs> | null
    /**
     * Filter, which PuestoEmpleadora to fetch.
     */
    where?: PuestoEmpleadoraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PuestoEmpleadoras to fetch.
     */
    orderBy?: PuestoEmpleadoraOrderByWithRelationInput | PuestoEmpleadoraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PuestoEmpleadoras.
     */
    cursor?: PuestoEmpleadoraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PuestoEmpleadoras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PuestoEmpleadoras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PuestoEmpleadoras.
     */
    distinct?: PuestoEmpleadoraScalarFieldEnum | PuestoEmpleadoraScalarFieldEnum[]
  }

  /**
   * PuestoEmpleadora findMany
   */
  export type PuestoEmpleadoraFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PuestoEmpleadora
     */
    select?: PuestoEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PuestoEmpleadora
     */
    omit?: PuestoEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PuestoEmpleadoraInclude<ExtArgs> | null
    /**
     * Filter, which PuestoEmpleadoras to fetch.
     */
    where?: PuestoEmpleadoraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PuestoEmpleadoras to fetch.
     */
    orderBy?: PuestoEmpleadoraOrderByWithRelationInput | PuestoEmpleadoraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PuestoEmpleadoras.
     */
    cursor?: PuestoEmpleadoraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PuestoEmpleadoras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PuestoEmpleadoras.
     */
    skip?: number
    distinct?: PuestoEmpleadoraScalarFieldEnum | PuestoEmpleadoraScalarFieldEnum[]
  }

  /**
   * PuestoEmpleadora create
   */
  export type PuestoEmpleadoraCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PuestoEmpleadora
     */
    select?: PuestoEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PuestoEmpleadora
     */
    omit?: PuestoEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PuestoEmpleadoraInclude<ExtArgs> | null
    /**
     * The data needed to create a PuestoEmpleadora.
     */
    data: XOR<PuestoEmpleadoraCreateInput, PuestoEmpleadoraUncheckedCreateInput>
  }

  /**
   * PuestoEmpleadora createMany
   */
  export type PuestoEmpleadoraCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PuestoEmpleadoras.
     */
    data: PuestoEmpleadoraCreateManyInput | PuestoEmpleadoraCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PuestoEmpleadora createManyAndReturn
   */
  export type PuestoEmpleadoraCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PuestoEmpleadora
     */
    select?: PuestoEmpleadoraSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PuestoEmpleadora
     */
    omit?: PuestoEmpleadoraOmit<ExtArgs> | null
    /**
     * The data used to create many PuestoEmpleadoras.
     */
    data: PuestoEmpleadoraCreateManyInput | PuestoEmpleadoraCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PuestoEmpleadoraIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PuestoEmpleadora update
   */
  export type PuestoEmpleadoraUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PuestoEmpleadora
     */
    select?: PuestoEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PuestoEmpleadora
     */
    omit?: PuestoEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PuestoEmpleadoraInclude<ExtArgs> | null
    /**
     * The data needed to update a PuestoEmpleadora.
     */
    data: XOR<PuestoEmpleadoraUpdateInput, PuestoEmpleadoraUncheckedUpdateInput>
    /**
     * Choose, which PuestoEmpleadora to update.
     */
    where: PuestoEmpleadoraWhereUniqueInput
  }

  /**
   * PuestoEmpleadora updateMany
   */
  export type PuestoEmpleadoraUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PuestoEmpleadoras.
     */
    data: XOR<PuestoEmpleadoraUpdateManyMutationInput, PuestoEmpleadoraUncheckedUpdateManyInput>
    /**
     * Filter which PuestoEmpleadoras to update
     */
    where?: PuestoEmpleadoraWhereInput
    /**
     * Limit how many PuestoEmpleadoras to update.
     */
    limit?: number
  }

  /**
   * PuestoEmpleadora updateManyAndReturn
   */
  export type PuestoEmpleadoraUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PuestoEmpleadora
     */
    select?: PuestoEmpleadoraSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PuestoEmpleadora
     */
    omit?: PuestoEmpleadoraOmit<ExtArgs> | null
    /**
     * The data used to update PuestoEmpleadoras.
     */
    data: XOR<PuestoEmpleadoraUpdateManyMutationInput, PuestoEmpleadoraUncheckedUpdateManyInput>
    /**
     * Filter which PuestoEmpleadoras to update
     */
    where?: PuestoEmpleadoraWhereInput
    /**
     * Limit how many PuestoEmpleadoras to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PuestoEmpleadoraIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * PuestoEmpleadora upsert
   */
  export type PuestoEmpleadoraUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PuestoEmpleadora
     */
    select?: PuestoEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PuestoEmpleadora
     */
    omit?: PuestoEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PuestoEmpleadoraInclude<ExtArgs> | null
    /**
     * The filter to search for the PuestoEmpleadora to update in case it exists.
     */
    where: PuestoEmpleadoraWhereUniqueInput
    /**
     * In case the PuestoEmpleadora found by the `where` argument doesn't exist, create a new PuestoEmpleadora with this data.
     */
    create: XOR<PuestoEmpleadoraCreateInput, PuestoEmpleadoraUncheckedCreateInput>
    /**
     * In case the PuestoEmpleadora was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PuestoEmpleadoraUpdateInput, PuestoEmpleadoraUncheckedUpdateInput>
  }

  /**
   * PuestoEmpleadora delete
   */
  export type PuestoEmpleadoraDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PuestoEmpleadora
     */
    select?: PuestoEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PuestoEmpleadora
     */
    omit?: PuestoEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PuestoEmpleadoraInclude<ExtArgs> | null
    /**
     * Filter which PuestoEmpleadora to delete.
     */
    where: PuestoEmpleadoraWhereUniqueInput
  }

  /**
   * PuestoEmpleadora deleteMany
   */
  export type PuestoEmpleadoraDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PuestoEmpleadoras to delete
     */
    where?: PuestoEmpleadoraWhereInput
    /**
     * Limit how many PuestoEmpleadoras to delete.
     */
    limit?: number
  }

  /**
   * PuestoEmpleadora.Empleado
   */
  export type PuestoEmpleadora$EmpleadoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Empleado
     */
    omit?: EmpleadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoInclude<ExtArgs> | null
    where?: EmpleadoWhereInput
    orderBy?: EmpleadoOrderByWithRelationInput | EmpleadoOrderByWithRelationInput[]
    cursor?: EmpleadoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EmpleadoScalarFieldEnum | EmpleadoScalarFieldEnum[]
  }

  /**
   * PuestoEmpleadora without action
   */
  export type PuestoEmpleadoraDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PuestoEmpleadora
     */
    select?: PuestoEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PuestoEmpleadora
     */
    omit?: PuestoEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PuestoEmpleadoraInclude<ExtArgs> | null
  }


  /**
   * Model UnidadEmpleadora
   */

  export type AggregateUnidadEmpleadora = {
    _count: UnidadEmpleadoraCountAggregateOutputType | null
    _avg: UnidadEmpleadoraAvgAggregateOutputType | null
    _sum: UnidadEmpleadoraSumAggregateOutputType | null
    _min: UnidadEmpleadoraMinAggregateOutputType | null
    _max: UnidadEmpleadoraMaxAggregateOutputType | null
  }

  export type UnidadEmpleadoraAvgAggregateOutputType = {
    idUnidadEmpleadora: number | null
    idEmpresaEmpleadora: number | null
    creadoPorId: number | null
    actualizadoPorId: number | null
  }

  export type UnidadEmpleadoraSumAggregateOutputType = {
    idUnidadEmpleadora: number | null
    idEmpresaEmpleadora: number | null
    creadoPorId: number | null
    actualizadoPorId: number | null
  }

  export type UnidadEmpleadoraMinAggregateOutputType = {
    idUnidadEmpleadora: number | null
    descripcion: string | null
    idEmpresaEmpleadora: number | null
    estado: boolean | null
    creadoPorId: number | null
    actualizadoPorId: number | null
    fechaCreacion: Date | null
    fechaModificacion: Date | null
  }

  export type UnidadEmpleadoraMaxAggregateOutputType = {
    idUnidadEmpleadora: number | null
    descripcion: string | null
    idEmpresaEmpleadora: number | null
    estado: boolean | null
    creadoPorId: number | null
    actualizadoPorId: number | null
    fechaCreacion: Date | null
    fechaModificacion: Date | null
  }

  export type UnidadEmpleadoraCountAggregateOutputType = {
    idUnidadEmpleadora: number
    descripcion: number
    idEmpresaEmpleadora: number
    estado: number
    creadoPorId: number
    actualizadoPorId: number
    fechaCreacion: number
    fechaModificacion: number
    _all: number
  }


  export type UnidadEmpleadoraAvgAggregateInputType = {
    idUnidadEmpleadora?: true
    idEmpresaEmpleadora?: true
    creadoPorId?: true
    actualizadoPorId?: true
  }

  export type UnidadEmpleadoraSumAggregateInputType = {
    idUnidadEmpleadora?: true
    idEmpresaEmpleadora?: true
    creadoPorId?: true
    actualizadoPorId?: true
  }

  export type UnidadEmpleadoraMinAggregateInputType = {
    idUnidadEmpleadora?: true
    descripcion?: true
    idEmpresaEmpleadora?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
  }

  export type UnidadEmpleadoraMaxAggregateInputType = {
    idUnidadEmpleadora?: true
    descripcion?: true
    idEmpresaEmpleadora?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
  }

  export type UnidadEmpleadoraCountAggregateInputType = {
    idUnidadEmpleadora?: true
    descripcion?: true
    idEmpresaEmpleadora?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
    _all?: true
  }

  export type UnidadEmpleadoraAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UnidadEmpleadora to aggregate.
     */
    where?: UnidadEmpleadoraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UnidadEmpleadoras to fetch.
     */
    orderBy?: UnidadEmpleadoraOrderByWithRelationInput | UnidadEmpleadoraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UnidadEmpleadoraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UnidadEmpleadoras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UnidadEmpleadoras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UnidadEmpleadoras
    **/
    _count?: true | UnidadEmpleadoraCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UnidadEmpleadoraAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UnidadEmpleadoraSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UnidadEmpleadoraMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UnidadEmpleadoraMaxAggregateInputType
  }

  export type GetUnidadEmpleadoraAggregateType<T extends UnidadEmpleadoraAggregateArgs> = {
        [P in keyof T & keyof AggregateUnidadEmpleadora]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUnidadEmpleadora[P]>
      : GetScalarType<T[P], AggregateUnidadEmpleadora[P]>
  }




  export type UnidadEmpleadoraGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UnidadEmpleadoraWhereInput
    orderBy?: UnidadEmpleadoraOrderByWithAggregationInput | UnidadEmpleadoraOrderByWithAggregationInput[]
    by: UnidadEmpleadoraScalarFieldEnum[] | UnidadEmpleadoraScalarFieldEnum
    having?: UnidadEmpleadoraScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UnidadEmpleadoraCountAggregateInputType | true
    _avg?: UnidadEmpleadoraAvgAggregateInputType
    _sum?: UnidadEmpleadoraSumAggregateInputType
    _min?: UnidadEmpleadoraMinAggregateInputType
    _max?: UnidadEmpleadoraMaxAggregateInputType
  }

  export type UnidadEmpleadoraGroupByOutputType = {
    idUnidadEmpleadora: number
    descripcion: string
    idEmpresaEmpleadora: number
    estado: boolean
    creadoPorId: number
    actualizadoPorId: number | null
    fechaCreacion: Date
    fechaModificacion: Date | null
    _count: UnidadEmpleadoraCountAggregateOutputType | null
    _avg: UnidadEmpleadoraAvgAggregateOutputType | null
    _sum: UnidadEmpleadoraSumAggregateOutputType | null
    _min: UnidadEmpleadoraMinAggregateOutputType | null
    _max: UnidadEmpleadoraMaxAggregateOutputType | null
  }

  type GetUnidadEmpleadoraGroupByPayload<T extends UnidadEmpleadoraGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UnidadEmpleadoraGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UnidadEmpleadoraGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UnidadEmpleadoraGroupByOutputType[P]>
            : GetScalarType<T[P], UnidadEmpleadoraGroupByOutputType[P]>
        }
      >
    >


  export type UnidadEmpleadoraSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idUnidadEmpleadora?: boolean
    descripcion?: boolean
    idEmpresaEmpleadora?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
    empleado?: boolean | UnidadEmpleadora$empleadoArgs<ExtArgs>
    _count?: boolean | UnidadEmpleadoraCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["unidadEmpleadora"]>

  export type UnidadEmpleadoraSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idUnidadEmpleadora?: boolean
    descripcion?: boolean
    idEmpresaEmpleadora?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["unidadEmpleadora"]>

  export type UnidadEmpleadoraSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idUnidadEmpleadora?: boolean
    descripcion?: boolean
    idEmpresaEmpleadora?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["unidadEmpleadora"]>

  export type UnidadEmpleadoraSelectScalar = {
    idUnidadEmpleadora?: boolean
    descripcion?: boolean
    idEmpresaEmpleadora?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
  }

  export type UnidadEmpleadoraOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"idUnidadEmpleadora" | "descripcion" | "idEmpresaEmpleadora" | "estado" | "creadoPorId" | "actualizadoPorId" | "fechaCreacion" | "fechaModificacion", ExtArgs["result"]["unidadEmpleadora"]>
  export type UnidadEmpleadoraInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
    empleado?: boolean | UnidadEmpleadora$empleadoArgs<ExtArgs>
    _count?: boolean | UnidadEmpleadoraCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UnidadEmpleadoraIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
  }
  export type UnidadEmpleadoraIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
  }

  export type $UnidadEmpleadoraPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UnidadEmpleadora"
    objects: {
      empresaEmpleadora: Prisma.$EmpresaEmpleadoraPayload<ExtArgs>
      empleado: Prisma.$EmpleadoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      idUnidadEmpleadora: number
      descripcion: string
      idEmpresaEmpleadora: number
      estado: boolean
      creadoPorId: number
      actualizadoPorId: number | null
      fechaCreacion: Date
      fechaModificacion: Date | null
    }, ExtArgs["result"]["unidadEmpleadora"]>
    composites: {}
  }

  type UnidadEmpleadoraGetPayload<S extends boolean | null | undefined | UnidadEmpleadoraDefaultArgs> = $Result.GetResult<Prisma.$UnidadEmpleadoraPayload, S>

  type UnidadEmpleadoraCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UnidadEmpleadoraFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UnidadEmpleadoraCountAggregateInputType | true
    }

  export interface UnidadEmpleadoraDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UnidadEmpleadora'], meta: { name: 'UnidadEmpleadora' } }
    /**
     * Find zero or one UnidadEmpleadora that matches the filter.
     * @param {UnidadEmpleadoraFindUniqueArgs} args - Arguments to find a UnidadEmpleadora
     * @example
     * // Get one UnidadEmpleadora
     * const unidadEmpleadora = await prisma.unidadEmpleadora.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UnidadEmpleadoraFindUniqueArgs>(args: SelectSubset<T, UnidadEmpleadoraFindUniqueArgs<ExtArgs>>): Prisma__UnidadEmpleadoraClient<$Result.GetResult<Prisma.$UnidadEmpleadoraPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UnidadEmpleadora that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UnidadEmpleadoraFindUniqueOrThrowArgs} args - Arguments to find a UnidadEmpleadora
     * @example
     * // Get one UnidadEmpleadora
     * const unidadEmpleadora = await prisma.unidadEmpleadora.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UnidadEmpleadoraFindUniqueOrThrowArgs>(args: SelectSubset<T, UnidadEmpleadoraFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UnidadEmpleadoraClient<$Result.GetResult<Prisma.$UnidadEmpleadoraPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UnidadEmpleadora that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnidadEmpleadoraFindFirstArgs} args - Arguments to find a UnidadEmpleadora
     * @example
     * // Get one UnidadEmpleadora
     * const unidadEmpleadora = await prisma.unidadEmpleadora.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UnidadEmpleadoraFindFirstArgs>(args?: SelectSubset<T, UnidadEmpleadoraFindFirstArgs<ExtArgs>>): Prisma__UnidadEmpleadoraClient<$Result.GetResult<Prisma.$UnidadEmpleadoraPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UnidadEmpleadora that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnidadEmpleadoraFindFirstOrThrowArgs} args - Arguments to find a UnidadEmpleadora
     * @example
     * // Get one UnidadEmpleadora
     * const unidadEmpleadora = await prisma.unidadEmpleadora.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UnidadEmpleadoraFindFirstOrThrowArgs>(args?: SelectSubset<T, UnidadEmpleadoraFindFirstOrThrowArgs<ExtArgs>>): Prisma__UnidadEmpleadoraClient<$Result.GetResult<Prisma.$UnidadEmpleadoraPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UnidadEmpleadoras that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnidadEmpleadoraFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UnidadEmpleadoras
     * const unidadEmpleadoras = await prisma.unidadEmpleadora.findMany()
     * 
     * // Get first 10 UnidadEmpleadoras
     * const unidadEmpleadoras = await prisma.unidadEmpleadora.findMany({ take: 10 })
     * 
     * // Only select the `idUnidadEmpleadora`
     * const unidadEmpleadoraWithIdUnidadEmpleadoraOnly = await prisma.unidadEmpleadora.findMany({ select: { idUnidadEmpleadora: true } })
     * 
     */
    findMany<T extends UnidadEmpleadoraFindManyArgs>(args?: SelectSubset<T, UnidadEmpleadoraFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UnidadEmpleadoraPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UnidadEmpleadora.
     * @param {UnidadEmpleadoraCreateArgs} args - Arguments to create a UnidadEmpleadora.
     * @example
     * // Create one UnidadEmpleadora
     * const UnidadEmpleadora = await prisma.unidadEmpleadora.create({
     *   data: {
     *     // ... data to create a UnidadEmpleadora
     *   }
     * })
     * 
     */
    create<T extends UnidadEmpleadoraCreateArgs>(args: SelectSubset<T, UnidadEmpleadoraCreateArgs<ExtArgs>>): Prisma__UnidadEmpleadoraClient<$Result.GetResult<Prisma.$UnidadEmpleadoraPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UnidadEmpleadoras.
     * @param {UnidadEmpleadoraCreateManyArgs} args - Arguments to create many UnidadEmpleadoras.
     * @example
     * // Create many UnidadEmpleadoras
     * const unidadEmpleadora = await prisma.unidadEmpleadora.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UnidadEmpleadoraCreateManyArgs>(args?: SelectSubset<T, UnidadEmpleadoraCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UnidadEmpleadoras and returns the data saved in the database.
     * @param {UnidadEmpleadoraCreateManyAndReturnArgs} args - Arguments to create many UnidadEmpleadoras.
     * @example
     * // Create many UnidadEmpleadoras
     * const unidadEmpleadora = await prisma.unidadEmpleadora.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UnidadEmpleadoras and only return the `idUnidadEmpleadora`
     * const unidadEmpleadoraWithIdUnidadEmpleadoraOnly = await prisma.unidadEmpleadora.createManyAndReturn({
     *   select: { idUnidadEmpleadora: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UnidadEmpleadoraCreateManyAndReturnArgs>(args?: SelectSubset<T, UnidadEmpleadoraCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UnidadEmpleadoraPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UnidadEmpleadora.
     * @param {UnidadEmpleadoraDeleteArgs} args - Arguments to delete one UnidadEmpleadora.
     * @example
     * // Delete one UnidadEmpleadora
     * const UnidadEmpleadora = await prisma.unidadEmpleadora.delete({
     *   where: {
     *     // ... filter to delete one UnidadEmpleadora
     *   }
     * })
     * 
     */
    delete<T extends UnidadEmpleadoraDeleteArgs>(args: SelectSubset<T, UnidadEmpleadoraDeleteArgs<ExtArgs>>): Prisma__UnidadEmpleadoraClient<$Result.GetResult<Prisma.$UnidadEmpleadoraPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UnidadEmpleadora.
     * @param {UnidadEmpleadoraUpdateArgs} args - Arguments to update one UnidadEmpleadora.
     * @example
     * // Update one UnidadEmpleadora
     * const unidadEmpleadora = await prisma.unidadEmpleadora.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UnidadEmpleadoraUpdateArgs>(args: SelectSubset<T, UnidadEmpleadoraUpdateArgs<ExtArgs>>): Prisma__UnidadEmpleadoraClient<$Result.GetResult<Prisma.$UnidadEmpleadoraPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UnidadEmpleadoras.
     * @param {UnidadEmpleadoraDeleteManyArgs} args - Arguments to filter UnidadEmpleadoras to delete.
     * @example
     * // Delete a few UnidadEmpleadoras
     * const { count } = await prisma.unidadEmpleadora.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UnidadEmpleadoraDeleteManyArgs>(args?: SelectSubset<T, UnidadEmpleadoraDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UnidadEmpleadoras.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnidadEmpleadoraUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UnidadEmpleadoras
     * const unidadEmpleadora = await prisma.unidadEmpleadora.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UnidadEmpleadoraUpdateManyArgs>(args: SelectSubset<T, UnidadEmpleadoraUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UnidadEmpleadoras and returns the data updated in the database.
     * @param {UnidadEmpleadoraUpdateManyAndReturnArgs} args - Arguments to update many UnidadEmpleadoras.
     * @example
     * // Update many UnidadEmpleadoras
     * const unidadEmpleadora = await prisma.unidadEmpleadora.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UnidadEmpleadoras and only return the `idUnidadEmpleadora`
     * const unidadEmpleadoraWithIdUnidadEmpleadoraOnly = await prisma.unidadEmpleadora.updateManyAndReturn({
     *   select: { idUnidadEmpleadora: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UnidadEmpleadoraUpdateManyAndReturnArgs>(args: SelectSubset<T, UnidadEmpleadoraUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UnidadEmpleadoraPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UnidadEmpleadora.
     * @param {UnidadEmpleadoraUpsertArgs} args - Arguments to update or create a UnidadEmpleadora.
     * @example
     * // Update or create a UnidadEmpleadora
     * const unidadEmpleadora = await prisma.unidadEmpleadora.upsert({
     *   create: {
     *     // ... data to create a UnidadEmpleadora
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UnidadEmpleadora we want to update
     *   }
     * })
     */
    upsert<T extends UnidadEmpleadoraUpsertArgs>(args: SelectSubset<T, UnidadEmpleadoraUpsertArgs<ExtArgs>>): Prisma__UnidadEmpleadoraClient<$Result.GetResult<Prisma.$UnidadEmpleadoraPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UnidadEmpleadoras.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnidadEmpleadoraCountArgs} args - Arguments to filter UnidadEmpleadoras to count.
     * @example
     * // Count the number of UnidadEmpleadoras
     * const count = await prisma.unidadEmpleadora.count({
     *   where: {
     *     // ... the filter for the UnidadEmpleadoras we want to count
     *   }
     * })
    **/
    count<T extends UnidadEmpleadoraCountArgs>(
      args?: Subset<T, UnidadEmpleadoraCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UnidadEmpleadoraCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UnidadEmpleadora.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnidadEmpleadoraAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UnidadEmpleadoraAggregateArgs>(args: Subset<T, UnidadEmpleadoraAggregateArgs>): Prisma.PrismaPromise<GetUnidadEmpleadoraAggregateType<T>>

    /**
     * Group by UnidadEmpleadora.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnidadEmpleadoraGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UnidadEmpleadoraGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UnidadEmpleadoraGroupByArgs['orderBy'] }
        : { orderBy?: UnidadEmpleadoraGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UnidadEmpleadoraGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUnidadEmpleadoraGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UnidadEmpleadora model
   */
  readonly fields: UnidadEmpleadoraFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UnidadEmpleadora.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UnidadEmpleadoraClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    empresaEmpleadora<T extends EmpresaEmpleadoraDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EmpresaEmpleadoraDefaultArgs<ExtArgs>>): Prisma__EmpresaEmpleadoraClient<$Result.GetResult<Prisma.$EmpresaEmpleadoraPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    empleado<T extends UnidadEmpleadora$empleadoArgs<ExtArgs> = {}>(args?: Subset<T, UnidadEmpleadora$empleadoArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UnidadEmpleadora model
   */
  interface UnidadEmpleadoraFieldRefs {
    readonly idUnidadEmpleadora: FieldRef<"UnidadEmpleadora", 'Int'>
    readonly descripcion: FieldRef<"UnidadEmpleadora", 'String'>
    readonly idEmpresaEmpleadora: FieldRef<"UnidadEmpleadora", 'Int'>
    readonly estado: FieldRef<"UnidadEmpleadora", 'Boolean'>
    readonly creadoPorId: FieldRef<"UnidadEmpleadora", 'Int'>
    readonly actualizadoPorId: FieldRef<"UnidadEmpleadora", 'Int'>
    readonly fechaCreacion: FieldRef<"UnidadEmpleadora", 'DateTime'>
    readonly fechaModificacion: FieldRef<"UnidadEmpleadora", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UnidadEmpleadora findUnique
   */
  export type UnidadEmpleadoraFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnidadEmpleadora
     */
    select?: UnidadEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnidadEmpleadora
     */
    omit?: UnidadEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnidadEmpleadoraInclude<ExtArgs> | null
    /**
     * Filter, which UnidadEmpleadora to fetch.
     */
    where: UnidadEmpleadoraWhereUniqueInput
  }

  /**
   * UnidadEmpleadora findUniqueOrThrow
   */
  export type UnidadEmpleadoraFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnidadEmpleadora
     */
    select?: UnidadEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnidadEmpleadora
     */
    omit?: UnidadEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnidadEmpleadoraInclude<ExtArgs> | null
    /**
     * Filter, which UnidadEmpleadora to fetch.
     */
    where: UnidadEmpleadoraWhereUniqueInput
  }

  /**
   * UnidadEmpleadora findFirst
   */
  export type UnidadEmpleadoraFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnidadEmpleadora
     */
    select?: UnidadEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnidadEmpleadora
     */
    omit?: UnidadEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnidadEmpleadoraInclude<ExtArgs> | null
    /**
     * Filter, which UnidadEmpleadora to fetch.
     */
    where?: UnidadEmpleadoraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UnidadEmpleadoras to fetch.
     */
    orderBy?: UnidadEmpleadoraOrderByWithRelationInput | UnidadEmpleadoraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UnidadEmpleadoras.
     */
    cursor?: UnidadEmpleadoraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UnidadEmpleadoras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UnidadEmpleadoras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UnidadEmpleadoras.
     */
    distinct?: UnidadEmpleadoraScalarFieldEnum | UnidadEmpleadoraScalarFieldEnum[]
  }

  /**
   * UnidadEmpleadora findFirstOrThrow
   */
  export type UnidadEmpleadoraFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnidadEmpleadora
     */
    select?: UnidadEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnidadEmpleadora
     */
    omit?: UnidadEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnidadEmpleadoraInclude<ExtArgs> | null
    /**
     * Filter, which UnidadEmpleadora to fetch.
     */
    where?: UnidadEmpleadoraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UnidadEmpleadoras to fetch.
     */
    orderBy?: UnidadEmpleadoraOrderByWithRelationInput | UnidadEmpleadoraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UnidadEmpleadoras.
     */
    cursor?: UnidadEmpleadoraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UnidadEmpleadoras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UnidadEmpleadoras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UnidadEmpleadoras.
     */
    distinct?: UnidadEmpleadoraScalarFieldEnum | UnidadEmpleadoraScalarFieldEnum[]
  }

  /**
   * UnidadEmpleadora findMany
   */
  export type UnidadEmpleadoraFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnidadEmpleadora
     */
    select?: UnidadEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnidadEmpleadora
     */
    omit?: UnidadEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnidadEmpleadoraInclude<ExtArgs> | null
    /**
     * Filter, which UnidadEmpleadoras to fetch.
     */
    where?: UnidadEmpleadoraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UnidadEmpleadoras to fetch.
     */
    orderBy?: UnidadEmpleadoraOrderByWithRelationInput | UnidadEmpleadoraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UnidadEmpleadoras.
     */
    cursor?: UnidadEmpleadoraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UnidadEmpleadoras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UnidadEmpleadoras.
     */
    skip?: number
    distinct?: UnidadEmpleadoraScalarFieldEnum | UnidadEmpleadoraScalarFieldEnum[]
  }

  /**
   * UnidadEmpleadora create
   */
  export type UnidadEmpleadoraCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnidadEmpleadora
     */
    select?: UnidadEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnidadEmpleadora
     */
    omit?: UnidadEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnidadEmpleadoraInclude<ExtArgs> | null
    /**
     * The data needed to create a UnidadEmpleadora.
     */
    data: XOR<UnidadEmpleadoraCreateInput, UnidadEmpleadoraUncheckedCreateInput>
  }

  /**
   * UnidadEmpleadora createMany
   */
  export type UnidadEmpleadoraCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UnidadEmpleadoras.
     */
    data: UnidadEmpleadoraCreateManyInput | UnidadEmpleadoraCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UnidadEmpleadora createManyAndReturn
   */
  export type UnidadEmpleadoraCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnidadEmpleadora
     */
    select?: UnidadEmpleadoraSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UnidadEmpleadora
     */
    omit?: UnidadEmpleadoraOmit<ExtArgs> | null
    /**
     * The data used to create many UnidadEmpleadoras.
     */
    data: UnidadEmpleadoraCreateManyInput | UnidadEmpleadoraCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnidadEmpleadoraIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UnidadEmpleadora update
   */
  export type UnidadEmpleadoraUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnidadEmpleadora
     */
    select?: UnidadEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnidadEmpleadora
     */
    omit?: UnidadEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnidadEmpleadoraInclude<ExtArgs> | null
    /**
     * The data needed to update a UnidadEmpleadora.
     */
    data: XOR<UnidadEmpleadoraUpdateInput, UnidadEmpleadoraUncheckedUpdateInput>
    /**
     * Choose, which UnidadEmpleadora to update.
     */
    where: UnidadEmpleadoraWhereUniqueInput
  }

  /**
   * UnidadEmpleadora updateMany
   */
  export type UnidadEmpleadoraUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UnidadEmpleadoras.
     */
    data: XOR<UnidadEmpleadoraUpdateManyMutationInput, UnidadEmpleadoraUncheckedUpdateManyInput>
    /**
     * Filter which UnidadEmpleadoras to update
     */
    where?: UnidadEmpleadoraWhereInput
    /**
     * Limit how many UnidadEmpleadoras to update.
     */
    limit?: number
  }

  /**
   * UnidadEmpleadora updateManyAndReturn
   */
  export type UnidadEmpleadoraUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnidadEmpleadora
     */
    select?: UnidadEmpleadoraSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UnidadEmpleadora
     */
    omit?: UnidadEmpleadoraOmit<ExtArgs> | null
    /**
     * The data used to update UnidadEmpleadoras.
     */
    data: XOR<UnidadEmpleadoraUpdateManyMutationInput, UnidadEmpleadoraUncheckedUpdateManyInput>
    /**
     * Filter which UnidadEmpleadoras to update
     */
    where?: UnidadEmpleadoraWhereInput
    /**
     * Limit how many UnidadEmpleadoras to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnidadEmpleadoraIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UnidadEmpleadora upsert
   */
  export type UnidadEmpleadoraUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnidadEmpleadora
     */
    select?: UnidadEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnidadEmpleadora
     */
    omit?: UnidadEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnidadEmpleadoraInclude<ExtArgs> | null
    /**
     * The filter to search for the UnidadEmpleadora to update in case it exists.
     */
    where: UnidadEmpleadoraWhereUniqueInput
    /**
     * In case the UnidadEmpleadora found by the `where` argument doesn't exist, create a new UnidadEmpleadora with this data.
     */
    create: XOR<UnidadEmpleadoraCreateInput, UnidadEmpleadoraUncheckedCreateInput>
    /**
     * In case the UnidadEmpleadora was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UnidadEmpleadoraUpdateInput, UnidadEmpleadoraUncheckedUpdateInput>
  }

  /**
   * UnidadEmpleadora delete
   */
  export type UnidadEmpleadoraDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnidadEmpleadora
     */
    select?: UnidadEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnidadEmpleadora
     */
    omit?: UnidadEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnidadEmpleadoraInclude<ExtArgs> | null
    /**
     * Filter which UnidadEmpleadora to delete.
     */
    where: UnidadEmpleadoraWhereUniqueInput
  }

  /**
   * UnidadEmpleadora deleteMany
   */
  export type UnidadEmpleadoraDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UnidadEmpleadoras to delete
     */
    where?: UnidadEmpleadoraWhereInput
    /**
     * Limit how many UnidadEmpleadoras to delete.
     */
    limit?: number
  }

  /**
   * UnidadEmpleadora.empleado
   */
  export type UnidadEmpleadora$empleadoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empleado
     */
    select?: EmpleadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Empleado
     */
    omit?: EmpleadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmpleadoInclude<ExtArgs> | null
    where?: EmpleadoWhereInput
    orderBy?: EmpleadoOrderByWithRelationInput | EmpleadoOrderByWithRelationInput[]
    cursor?: EmpleadoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EmpleadoScalarFieldEnum | EmpleadoScalarFieldEnum[]
  }

  /**
   * UnidadEmpleadora without action
   */
  export type UnidadEmpleadoraDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnidadEmpleadora
     */
    select?: UnidadEmpleadoraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnidadEmpleadora
     */
    omit?: UnidadEmpleadoraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnidadEmpleadoraInclude<ExtArgs> | null
  }


  /**
   * Model Objetivo
   */

  export type AggregateObjetivo = {
    _count: ObjetivoCountAggregateOutputType | null
    _avg: ObjetivoAvgAggregateOutputType | null
    _sum: ObjetivoSumAggregateOutputType | null
    _min: ObjetivoMinAggregateOutputType | null
    _max: ObjetivoMaxAggregateOutputType | null
  }

  export type ObjetivoAvgAggregateOutputType = {
    idObjetivo: number | null
    idEmpresaEmpleadora: number | null
    idEmpleado: number | null
    creadoPorId: number | null
    actualizadoPorId: number | null
  }

  export type ObjetivoSumAggregateOutputType = {
    idObjetivo: number | null
    idEmpresaEmpleadora: number | null
    idEmpleado: number | null
    creadoPorId: number | null
    actualizadoPorId: number | null
  }

  export type ObjetivoMinAggregateOutputType = {
    idObjetivo: number | null
    fechaVigenciaInicia: Date | null
    fechaVigenciaFin: Date | null
    idEmpresaEmpleadora: number | null
    idEmpleado: number | null
    estado: boolean | null
    creadoPorId: number | null
    actualizadoPorId: number | null
    fechaCreacion: Date | null
    fechaModificacion: Date | null
  }

  export type ObjetivoMaxAggregateOutputType = {
    idObjetivo: number | null
    fechaVigenciaInicia: Date | null
    fechaVigenciaFin: Date | null
    idEmpresaEmpleadora: number | null
    idEmpleado: number | null
    estado: boolean | null
    creadoPorId: number | null
    actualizadoPorId: number | null
    fechaCreacion: Date | null
    fechaModificacion: Date | null
  }

  export type ObjetivoCountAggregateOutputType = {
    idObjetivo: number
    fechaVigenciaInicia: number
    fechaVigenciaFin: number
    idEmpresaEmpleadora: number
    idEmpleado: number
    estado: number
    creadoPorId: number
    actualizadoPorId: number
    fechaCreacion: number
    fechaModificacion: number
    _all: number
  }


  export type ObjetivoAvgAggregateInputType = {
    idObjetivo?: true
    idEmpresaEmpleadora?: true
    idEmpleado?: true
    creadoPorId?: true
    actualizadoPorId?: true
  }

  export type ObjetivoSumAggregateInputType = {
    idObjetivo?: true
    idEmpresaEmpleadora?: true
    idEmpleado?: true
    creadoPorId?: true
    actualizadoPorId?: true
  }

  export type ObjetivoMinAggregateInputType = {
    idObjetivo?: true
    fechaVigenciaInicia?: true
    fechaVigenciaFin?: true
    idEmpresaEmpleadora?: true
    idEmpleado?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
  }

  export type ObjetivoMaxAggregateInputType = {
    idObjetivo?: true
    fechaVigenciaInicia?: true
    fechaVigenciaFin?: true
    idEmpresaEmpleadora?: true
    idEmpleado?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
  }

  export type ObjetivoCountAggregateInputType = {
    idObjetivo?: true
    fechaVigenciaInicia?: true
    fechaVigenciaFin?: true
    idEmpresaEmpleadora?: true
    idEmpleado?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
    _all?: true
  }

  export type ObjetivoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Objetivo to aggregate.
     */
    where?: ObjetivoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Objetivos to fetch.
     */
    orderBy?: ObjetivoOrderByWithRelationInput | ObjetivoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ObjetivoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Objetivos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Objetivos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Objetivos
    **/
    _count?: true | ObjetivoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ObjetivoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ObjetivoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ObjetivoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ObjetivoMaxAggregateInputType
  }

  export type GetObjetivoAggregateType<T extends ObjetivoAggregateArgs> = {
        [P in keyof T & keyof AggregateObjetivo]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateObjetivo[P]>
      : GetScalarType<T[P], AggregateObjetivo[P]>
  }




  export type ObjetivoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ObjetivoWhereInput
    orderBy?: ObjetivoOrderByWithAggregationInput | ObjetivoOrderByWithAggregationInput[]
    by: ObjetivoScalarFieldEnum[] | ObjetivoScalarFieldEnum
    having?: ObjetivoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ObjetivoCountAggregateInputType | true
    _avg?: ObjetivoAvgAggregateInputType
    _sum?: ObjetivoSumAggregateInputType
    _min?: ObjetivoMinAggregateInputType
    _max?: ObjetivoMaxAggregateInputType
  }

  export type ObjetivoGroupByOutputType = {
    idObjetivo: number
    fechaVigenciaInicia: Date
    fechaVigenciaFin: Date
    idEmpresaEmpleadora: number
    idEmpleado: number
    estado: boolean
    creadoPorId: number
    actualizadoPorId: number | null
    fechaCreacion: Date
    fechaModificacion: Date | null
    _count: ObjetivoCountAggregateOutputType | null
    _avg: ObjetivoAvgAggregateOutputType | null
    _sum: ObjetivoSumAggregateOutputType | null
    _min: ObjetivoMinAggregateOutputType | null
    _max: ObjetivoMaxAggregateOutputType | null
  }

  type GetObjetivoGroupByPayload<T extends ObjetivoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ObjetivoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ObjetivoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ObjetivoGroupByOutputType[P]>
            : GetScalarType<T[P], ObjetivoGroupByOutputType[P]>
        }
      >
    >


  export type ObjetivoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idObjetivo?: boolean
    fechaVigenciaInicia?: boolean
    fechaVigenciaFin?: boolean
    idEmpresaEmpleadora?: boolean
    idEmpleado?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
    empleado?: boolean | EmpleadoDefaultArgs<ExtArgs>
    ObjetivoDetalle?: boolean | Objetivo$ObjetivoDetalleArgs<ExtArgs>
    _count?: boolean | ObjetivoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["objetivo"]>

  export type ObjetivoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idObjetivo?: boolean
    fechaVigenciaInicia?: boolean
    fechaVigenciaFin?: boolean
    idEmpresaEmpleadora?: boolean
    idEmpleado?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
    empleado?: boolean | EmpleadoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["objetivo"]>

  export type ObjetivoSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idObjetivo?: boolean
    fechaVigenciaInicia?: boolean
    fechaVigenciaFin?: boolean
    idEmpresaEmpleadora?: boolean
    idEmpleado?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
    empleado?: boolean | EmpleadoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["objetivo"]>

  export type ObjetivoSelectScalar = {
    idObjetivo?: boolean
    fechaVigenciaInicia?: boolean
    fechaVigenciaFin?: boolean
    idEmpresaEmpleadora?: boolean
    idEmpleado?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
  }

  export type ObjetivoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"idObjetivo" | "fechaVigenciaInicia" | "fechaVigenciaFin" | "idEmpresaEmpleadora" | "idEmpleado" | "estado" | "creadoPorId" | "actualizadoPorId" | "fechaCreacion" | "fechaModificacion", ExtArgs["result"]["objetivo"]>
  export type ObjetivoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
    empleado?: boolean | EmpleadoDefaultArgs<ExtArgs>
    ObjetivoDetalle?: boolean | Objetivo$ObjetivoDetalleArgs<ExtArgs>
    _count?: boolean | ObjetivoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ObjetivoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
    empleado?: boolean | EmpleadoDefaultArgs<ExtArgs>
  }
  export type ObjetivoIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    empresaEmpleadora?: boolean | EmpresaEmpleadoraDefaultArgs<ExtArgs>
    empleado?: boolean | EmpleadoDefaultArgs<ExtArgs>
  }

  export type $ObjetivoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Objetivo"
    objects: {
      empresaEmpleadora: Prisma.$EmpresaEmpleadoraPayload<ExtArgs>
      empleado: Prisma.$EmpleadoPayload<ExtArgs>
      ObjetivoDetalle: Prisma.$ObjetivoDetallePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      idObjetivo: number
      fechaVigenciaInicia: Date
      fechaVigenciaFin: Date
      idEmpresaEmpleadora: number
      idEmpleado: number
      estado: boolean
      creadoPorId: number
      actualizadoPorId: number | null
      fechaCreacion: Date
      fechaModificacion: Date | null
    }, ExtArgs["result"]["objetivo"]>
    composites: {}
  }

  type ObjetivoGetPayload<S extends boolean | null | undefined | ObjetivoDefaultArgs> = $Result.GetResult<Prisma.$ObjetivoPayload, S>

  type ObjetivoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ObjetivoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ObjetivoCountAggregateInputType | true
    }

  export interface ObjetivoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Objetivo'], meta: { name: 'Objetivo' } }
    /**
     * Find zero or one Objetivo that matches the filter.
     * @param {ObjetivoFindUniqueArgs} args - Arguments to find a Objetivo
     * @example
     * // Get one Objetivo
     * const objetivo = await prisma.objetivo.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ObjetivoFindUniqueArgs>(args: SelectSubset<T, ObjetivoFindUniqueArgs<ExtArgs>>): Prisma__ObjetivoClient<$Result.GetResult<Prisma.$ObjetivoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Objetivo that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ObjetivoFindUniqueOrThrowArgs} args - Arguments to find a Objetivo
     * @example
     * // Get one Objetivo
     * const objetivo = await prisma.objetivo.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ObjetivoFindUniqueOrThrowArgs>(args: SelectSubset<T, ObjetivoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ObjetivoClient<$Result.GetResult<Prisma.$ObjetivoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Objetivo that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ObjetivoFindFirstArgs} args - Arguments to find a Objetivo
     * @example
     * // Get one Objetivo
     * const objetivo = await prisma.objetivo.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ObjetivoFindFirstArgs>(args?: SelectSubset<T, ObjetivoFindFirstArgs<ExtArgs>>): Prisma__ObjetivoClient<$Result.GetResult<Prisma.$ObjetivoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Objetivo that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ObjetivoFindFirstOrThrowArgs} args - Arguments to find a Objetivo
     * @example
     * // Get one Objetivo
     * const objetivo = await prisma.objetivo.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ObjetivoFindFirstOrThrowArgs>(args?: SelectSubset<T, ObjetivoFindFirstOrThrowArgs<ExtArgs>>): Prisma__ObjetivoClient<$Result.GetResult<Prisma.$ObjetivoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Objetivos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ObjetivoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Objetivos
     * const objetivos = await prisma.objetivo.findMany()
     * 
     * // Get first 10 Objetivos
     * const objetivos = await prisma.objetivo.findMany({ take: 10 })
     * 
     * // Only select the `idObjetivo`
     * const objetivoWithIdObjetivoOnly = await prisma.objetivo.findMany({ select: { idObjetivo: true } })
     * 
     */
    findMany<T extends ObjetivoFindManyArgs>(args?: SelectSubset<T, ObjetivoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ObjetivoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Objetivo.
     * @param {ObjetivoCreateArgs} args - Arguments to create a Objetivo.
     * @example
     * // Create one Objetivo
     * const Objetivo = await prisma.objetivo.create({
     *   data: {
     *     // ... data to create a Objetivo
     *   }
     * })
     * 
     */
    create<T extends ObjetivoCreateArgs>(args: SelectSubset<T, ObjetivoCreateArgs<ExtArgs>>): Prisma__ObjetivoClient<$Result.GetResult<Prisma.$ObjetivoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Objetivos.
     * @param {ObjetivoCreateManyArgs} args - Arguments to create many Objetivos.
     * @example
     * // Create many Objetivos
     * const objetivo = await prisma.objetivo.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ObjetivoCreateManyArgs>(args?: SelectSubset<T, ObjetivoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Objetivos and returns the data saved in the database.
     * @param {ObjetivoCreateManyAndReturnArgs} args - Arguments to create many Objetivos.
     * @example
     * // Create many Objetivos
     * const objetivo = await prisma.objetivo.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Objetivos and only return the `idObjetivo`
     * const objetivoWithIdObjetivoOnly = await prisma.objetivo.createManyAndReturn({
     *   select: { idObjetivo: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ObjetivoCreateManyAndReturnArgs>(args?: SelectSubset<T, ObjetivoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ObjetivoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Objetivo.
     * @param {ObjetivoDeleteArgs} args - Arguments to delete one Objetivo.
     * @example
     * // Delete one Objetivo
     * const Objetivo = await prisma.objetivo.delete({
     *   where: {
     *     // ... filter to delete one Objetivo
     *   }
     * })
     * 
     */
    delete<T extends ObjetivoDeleteArgs>(args: SelectSubset<T, ObjetivoDeleteArgs<ExtArgs>>): Prisma__ObjetivoClient<$Result.GetResult<Prisma.$ObjetivoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Objetivo.
     * @param {ObjetivoUpdateArgs} args - Arguments to update one Objetivo.
     * @example
     * // Update one Objetivo
     * const objetivo = await prisma.objetivo.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ObjetivoUpdateArgs>(args: SelectSubset<T, ObjetivoUpdateArgs<ExtArgs>>): Prisma__ObjetivoClient<$Result.GetResult<Prisma.$ObjetivoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Objetivos.
     * @param {ObjetivoDeleteManyArgs} args - Arguments to filter Objetivos to delete.
     * @example
     * // Delete a few Objetivos
     * const { count } = await prisma.objetivo.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ObjetivoDeleteManyArgs>(args?: SelectSubset<T, ObjetivoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Objetivos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ObjetivoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Objetivos
     * const objetivo = await prisma.objetivo.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ObjetivoUpdateManyArgs>(args: SelectSubset<T, ObjetivoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Objetivos and returns the data updated in the database.
     * @param {ObjetivoUpdateManyAndReturnArgs} args - Arguments to update many Objetivos.
     * @example
     * // Update many Objetivos
     * const objetivo = await prisma.objetivo.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Objetivos and only return the `idObjetivo`
     * const objetivoWithIdObjetivoOnly = await prisma.objetivo.updateManyAndReturn({
     *   select: { idObjetivo: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ObjetivoUpdateManyAndReturnArgs>(args: SelectSubset<T, ObjetivoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ObjetivoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Objetivo.
     * @param {ObjetivoUpsertArgs} args - Arguments to update or create a Objetivo.
     * @example
     * // Update or create a Objetivo
     * const objetivo = await prisma.objetivo.upsert({
     *   create: {
     *     // ... data to create a Objetivo
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Objetivo we want to update
     *   }
     * })
     */
    upsert<T extends ObjetivoUpsertArgs>(args: SelectSubset<T, ObjetivoUpsertArgs<ExtArgs>>): Prisma__ObjetivoClient<$Result.GetResult<Prisma.$ObjetivoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Objetivos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ObjetivoCountArgs} args - Arguments to filter Objetivos to count.
     * @example
     * // Count the number of Objetivos
     * const count = await prisma.objetivo.count({
     *   where: {
     *     // ... the filter for the Objetivos we want to count
     *   }
     * })
    **/
    count<T extends ObjetivoCountArgs>(
      args?: Subset<T, ObjetivoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ObjetivoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Objetivo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ObjetivoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ObjetivoAggregateArgs>(args: Subset<T, ObjetivoAggregateArgs>): Prisma.PrismaPromise<GetObjetivoAggregateType<T>>

    /**
     * Group by Objetivo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ObjetivoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ObjetivoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ObjetivoGroupByArgs['orderBy'] }
        : { orderBy?: ObjetivoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ObjetivoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetObjetivoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Objetivo model
   */
  readonly fields: ObjetivoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Objetivo.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ObjetivoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    empresaEmpleadora<T extends EmpresaEmpleadoraDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EmpresaEmpleadoraDefaultArgs<ExtArgs>>): Prisma__EmpresaEmpleadoraClient<$Result.GetResult<Prisma.$EmpresaEmpleadoraPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    empleado<T extends EmpleadoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EmpleadoDefaultArgs<ExtArgs>>): Prisma__EmpleadoClient<$Result.GetResult<Prisma.$EmpleadoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    ObjetivoDetalle<T extends Objetivo$ObjetivoDetalleArgs<ExtArgs> = {}>(args?: Subset<T, Objetivo$ObjetivoDetalleArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ObjetivoDetallePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Objetivo model
   */
  interface ObjetivoFieldRefs {
    readonly idObjetivo: FieldRef<"Objetivo", 'Int'>
    readonly fechaVigenciaInicia: FieldRef<"Objetivo", 'DateTime'>
    readonly fechaVigenciaFin: FieldRef<"Objetivo", 'DateTime'>
    readonly idEmpresaEmpleadora: FieldRef<"Objetivo", 'Int'>
    readonly idEmpleado: FieldRef<"Objetivo", 'Int'>
    readonly estado: FieldRef<"Objetivo", 'Boolean'>
    readonly creadoPorId: FieldRef<"Objetivo", 'Int'>
    readonly actualizadoPorId: FieldRef<"Objetivo", 'Int'>
    readonly fechaCreacion: FieldRef<"Objetivo", 'DateTime'>
    readonly fechaModificacion: FieldRef<"Objetivo", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Objetivo findUnique
   */
  export type ObjetivoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoInclude<ExtArgs> | null
    /**
     * Filter, which Objetivo to fetch.
     */
    where: ObjetivoWhereUniqueInput
  }

  /**
   * Objetivo findUniqueOrThrow
   */
  export type ObjetivoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoInclude<ExtArgs> | null
    /**
     * Filter, which Objetivo to fetch.
     */
    where: ObjetivoWhereUniqueInput
  }

  /**
   * Objetivo findFirst
   */
  export type ObjetivoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoInclude<ExtArgs> | null
    /**
     * Filter, which Objetivo to fetch.
     */
    where?: ObjetivoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Objetivos to fetch.
     */
    orderBy?: ObjetivoOrderByWithRelationInput | ObjetivoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Objetivos.
     */
    cursor?: ObjetivoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Objetivos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Objetivos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Objetivos.
     */
    distinct?: ObjetivoScalarFieldEnum | ObjetivoScalarFieldEnum[]
  }

  /**
   * Objetivo findFirstOrThrow
   */
  export type ObjetivoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoInclude<ExtArgs> | null
    /**
     * Filter, which Objetivo to fetch.
     */
    where?: ObjetivoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Objetivos to fetch.
     */
    orderBy?: ObjetivoOrderByWithRelationInput | ObjetivoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Objetivos.
     */
    cursor?: ObjetivoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Objetivos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Objetivos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Objetivos.
     */
    distinct?: ObjetivoScalarFieldEnum | ObjetivoScalarFieldEnum[]
  }

  /**
   * Objetivo findMany
   */
  export type ObjetivoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoInclude<ExtArgs> | null
    /**
     * Filter, which Objetivos to fetch.
     */
    where?: ObjetivoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Objetivos to fetch.
     */
    orderBy?: ObjetivoOrderByWithRelationInput | ObjetivoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Objetivos.
     */
    cursor?: ObjetivoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Objetivos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Objetivos.
     */
    skip?: number
    distinct?: ObjetivoScalarFieldEnum | ObjetivoScalarFieldEnum[]
  }

  /**
   * Objetivo create
   */
  export type ObjetivoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoInclude<ExtArgs> | null
    /**
     * The data needed to create a Objetivo.
     */
    data: XOR<ObjetivoCreateInput, ObjetivoUncheckedCreateInput>
  }

  /**
   * Objetivo createMany
   */
  export type ObjetivoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Objetivos.
     */
    data: ObjetivoCreateManyInput | ObjetivoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Objetivo createManyAndReturn
   */
  export type ObjetivoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * The data used to create many Objetivos.
     */
    data: ObjetivoCreateManyInput | ObjetivoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Objetivo update
   */
  export type ObjetivoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoInclude<ExtArgs> | null
    /**
     * The data needed to update a Objetivo.
     */
    data: XOR<ObjetivoUpdateInput, ObjetivoUncheckedUpdateInput>
    /**
     * Choose, which Objetivo to update.
     */
    where: ObjetivoWhereUniqueInput
  }

  /**
   * Objetivo updateMany
   */
  export type ObjetivoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Objetivos.
     */
    data: XOR<ObjetivoUpdateManyMutationInput, ObjetivoUncheckedUpdateManyInput>
    /**
     * Filter which Objetivos to update
     */
    where?: ObjetivoWhereInput
    /**
     * Limit how many Objetivos to update.
     */
    limit?: number
  }

  /**
   * Objetivo updateManyAndReturn
   */
  export type ObjetivoUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * The data used to update Objetivos.
     */
    data: XOR<ObjetivoUpdateManyMutationInput, ObjetivoUncheckedUpdateManyInput>
    /**
     * Filter which Objetivos to update
     */
    where?: ObjetivoWhereInput
    /**
     * Limit how many Objetivos to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Objetivo upsert
   */
  export type ObjetivoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoInclude<ExtArgs> | null
    /**
     * The filter to search for the Objetivo to update in case it exists.
     */
    where: ObjetivoWhereUniqueInput
    /**
     * In case the Objetivo found by the `where` argument doesn't exist, create a new Objetivo with this data.
     */
    create: XOR<ObjetivoCreateInput, ObjetivoUncheckedCreateInput>
    /**
     * In case the Objetivo was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ObjetivoUpdateInput, ObjetivoUncheckedUpdateInput>
  }

  /**
   * Objetivo delete
   */
  export type ObjetivoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoInclude<ExtArgs> | null
    /**
     * Filter which Objetivo to delete.
     */
    where: ObjetivoWhereUniqueInput
  }

  /**
   * Objetivo deleteMany
   */
  export type ObjetivoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Objetivos to delete
     */
    where?: ObjetivoWhereInput
    /**
     * Limit how many Objetivos to delete.
     */
    limit?: number
  }

  /**
   * Objetivo.ObjetivoDetalle
   */
  export type Objetivo$ObjetivoDetalleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ObjetivoDetalle
     */
    select?: ObjetivoDetalleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ObjetivoDetalle
     */
    omit?: ObjetivoDetalleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoDetalleInclude<ExtArgs> | null
    where?: ObjetivoDetalleWhereInput
    orderBy?: ObjetivoDetalleOrderByWithRelationInput | ObjetivoDetalleOrderByWithRelationInput[]
    cursor?: ObjetivoDetalleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ObjetivoDetalleScalarFieldEnum | ObjetivoDetalleScalarFieldEnum[]
  }

  /**
   * Objetivo without action
   */
  export type ObjetivoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoInclude<ExtArgs> | null
  }


  /**
   * Model ObjetivoDetalle
   */

  export type AggregateObjetivoDetalle = {
    _count: ObjetivoDetalleCountAggregateOutputType | null
    _avg: ObjetivoDetalleAvgAggregateOutputType | null
    _sum: ObjetivoDetalleSumAggregateOutputType | null
    _min: ObjetivoDetalleMinAggregateOutputType | null
    _max: ObjetivoDetalleMaxAggregateOutputType | null
  }

  export type ObjetivoDetalleAvgAggregateOutputType = {
    idObjetivoDetalle: number | null
    idObjetivo: number | null
    secuencial: number | null
    pesoEspecifico: number | null
    creadoPorId: number | null
    actualizadoPorId: number | null
  }

  export type ObjetivoDetalleSumAggregateOutputType = {
    idObjetivoDetalle: number | null
    idObjetivo: number | null
    secuencial: number | null
    pesoEspecifico: number | null
    creadoPorId: number | null
    actualizadoPorId: number | null
  }

  export type ObjetivoDetalleMinAggregateOutputType = {
    idObjetivoDetalle: number | null
    idObjetivo: number | null
    secuencial: number | null
    descripcion: string | null
    descripcionIniciativa: string | null
    unidadMedida: string | null
    pesoEspecifico: number | null
    estado: boolean | null
    creadoPorId: number | null
    actualizadoPorId: number | null
    fechaCreacion: Date | null
    fechaModificacion: Date | null
  }

  export type ObjetivoDetalleMaxAggregateOutputType = {
    idObjetivoDetalle: number | null
    idObjetivo: number | null
    secuencial: number | null
    descripcion: string | null
    descripcionIniciativa: string | null
    unidadMedida: string | null
    pesoEspecifico: number | null
    estado: boolean | null
    creadoPorId: number | null
    actualizadoPorId: number | null
    fechaCreacion: Date | null
    fechaModificacion: Date | null
  }

  export type ObjetivoDetalleCountAggregateOutputType = {
    idObjetivoDetalle: number
    idObjetivo: number
    secuencial: number
    descripcion: number
    descripcionIniciativa: number
    unidadMedida: number
    pesoEspecifico: number
    estado: number
    creadoPorId: number
    actualizadoPorId: number
    fechaCreacion: number
    fechaModificacion: number
    _all: number
  }


  export type ObjetivoDetalleAvgAggregateInputType = {
    idObjetivoDetalle?: true
    idObjetivo?: true
    secuencial?: true
    pesoEspecifico?: true
    creadoPorId?: true
    actualizadoPorId?: true
  }

  export type ObjetivoDetalleSumAggregateInputType = {
    idObjetivoDetalle?: true
    idObjetivo?: true
    secuencial?: true
    pesoEspecifico?: true
    creadoPorId?: true
    actualizadoPorId?: true
  }

  export type ObjetivoDetalleMinAggregateInputType = {
    idObjetivoDetalle?: true
    idObjetivo?: true
    secuencial?: true
    descripcion?: true
    descripcionIniciativa?: true
    unidadMedida?: true
    pesoEspecifico?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
  }

  export type ObjetivoDetalleMaxAggregateInputType = {
    idObjetivoDetalle?: true
    idObjetivo?: true
    secuencial?: true
    descripcion?: true
    descripcionIniciativa?: true
    unidadMedida?: true
    pesoEspecifico?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
  }

  export type ObjetivoDetalleCountAggregateInputType = {
    idObjetivoDetalle?: true
    idObjetivo?: true
    secuencial?: true
    descripcion?: true
    descripcionIniciativa?: true
    unidadMedida?: true
    pesoEspecifico?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
    _all?: true
  }

  export type ObjetivoDetalleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ObjetivoDetalle to aggregate.
     */
    where?: ObjetivoDetalleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ObjetivoDetalles to fetch.
     */
    orderBy?: ObjetivoDetalleOrderByWithRelationInput | ObjetivoDetalleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ObjetivoDetalleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ObjetivoDetalles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ObjetivoDetalles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ObjetivoDetalles
    **/
    _count?: true | ObjetivoDetalleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ObjetivoDetalleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ObjetivoDetalleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ObjetivoDetalleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ObjetivoDetalleMaxAggregateInputType
  }

  export type GetObjetivoDetalleAggregateType<T extends ObjetivoDetalleAggregateArgs> = {
        [P in keyof T & keyof AggregateObjetivoDetalle]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateObjetivoDetalle[P]>
      : GetScalarType<T[P], AggregateObjetivoDetalle[P]>
  }




  export type ObjetivoDetalleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ObjetivoDetalleWhereInput
    orderBy?: ObjetivoDetalleOrderByWithAggregationInput | ObjetivoDetalleOrderByWithAggregationInput[]
    by: ObjetivoDetalleScalarFieldEnum[] | ObjetivoDetalleScalarFieldEnum
    having?: ObjetivoDetalleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ObjetivoDetalleCountAggregateInputType | true
    _avg?: ObjetivoDetalleAvgAggregateInputType
    _sum?: ObjetivoDetalleSumAggregateInputType
    _min?: ObjetivoDetalleMinAggregateInputType
    _max?: ObjetivoDetalleMaxAggregateInputType
  }

  export type ObjetivoDetalleGroupByOutputType = {
    idObjetivoDetalle: number
    idObjetivo: number
    secuencial: number
    descripcion: string | null
    descripcionIniciativa: string | null
    unidadMedida: string | null
    pesoEspecifico: number | null
    estado: boolean
    creadoPorId: number
    actualizadoPorId: number | null
    fechaCreacion: Date
    fechaModificacion: Date | null
    _count: ObjetivoDetalleCountAggregateOutputType | null
    _avg: ObjetivoDetalleAvgAggregateOutputType | null
    _sum: ObjetivoDetalleSumAggregateOutputType | null
    _min: ObjetivoDetalleMinAggregateOutputType | null
    _max: ObjetivoDetalleMaxAggregateOutputType | null
  }

  type GetObjetivoDetalleGroupByPayload<T extends ObjetivoDetalleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ObjetivoDetalleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ObjetivoDetalleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ObjetivoDetalleGroupByOutputType[P]>
            : GetScalarType<T[P], ObjetivoDetalleGroupByOutputType[P]>
        }
      >
    >


  export type ObjetivoDetalleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idObjetivoDetalle?: boolean
    idObjetivo?: boolean
    secuencial?: boolean
    descripcion?: boolean
    descripcionIniciativa?: boolean
    unidadMedida?: boolean
    pesoEspecifico?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
    objetivo?: boolean | ObjetivoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["objetivoDetalle"]>

  export type ObjetivoDetalleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idObjetivoDetalle?: boolean
    idObjetivo?: boolean
    secuencial?: boolean
    descripcion?: boolean
    descripcionIniciativa?: boolean
    unidadMedida?: boolean
    pesoEspecifico?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
    objetivo?: boolean | ObjetivoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["objetivoDetalle"]>

  export type ObjetivoDetalleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idObjetivoDetalle?: boolean
    idObjetivo?: boolean
    secuencial?: boolean
    descripcion?: boolean
    descripcionIniciativa?: boolean
    unidadMedida?: boolean
    pesoEspecifico?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
    objetivo?: boolean | ObjetivoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["objetivoDetalle"]>

  export type ObjetivoDetalleSelectScalar = {
    idObjetivoDetalle?: boolean
    idObjetivo?: boolean
    secuencial?: boolean
    descripcion?: boolean
    descripcionIniciativa?: boolean
    unidadMedida?: boolean
    pesoEspecifico?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
  }

  export type ObjetivoDetalleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"idObjetivoDetalle" | "idObjetivo" | "secuencial" | "descripcion" | "descripcionIniciativa" | "unidadMedida" | "pesoEspecifico" | "estado" | "creadoPorId" | "actualizadoPorId" | "fechaCreacion" | "fechaModificacion", ExtArgs["result"]["objetivoDetalle"]>
  export type ObjetivoDetalleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    objetivo?: boolean | ObjetivoDefaultArgs<ExtArgs>
  }
  export type ObjetivoDetalleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    objetivo?: boolean | ObjetivoDefaultArgs<ExtArgs>
  }
  export type ObjetivoDetalleIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    objetivo?: boolean | ObjetivoDefaultArgs<ExtArgs>
  }

  export type $ObjetivoDetallePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ObjetivoDetalle"
    objects: {
      objetivo: Prisma.$ObjetivoPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      idObjetivoDetalle: number
      idObjetivo: number
      secuencial: number
      descripcion: string | null
      descripcionIniciativa: string | null
      unidadMedida: string | null
      pesoEspecifico: number | null
      estado: boolean
      creadoPorId: number
      actualizadoPorId: number | null
      fechaCreacion: Date
      fechaModificacion: Date | null
    }, ExtArgs["result"]["objetivoDetalle"]>
    composites: {}
  }

  type ObjetivoDetalleGetPayload<S extends boolean | null | undefined | ObjetivoDetalleDefaultArgs> = $Result.GetResult<Prisma.$ObjetivoDetallePayload, S>

  type ObjetivoDetalleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ObjetivoDetalleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ObjetivoDetalleCountAggregateInputType | true
    }

  export interface ObjetivoDetalleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ObjetivoDetalle'], meta: { name: 'ObjetivoDetalle' } }
    /**
     * Find zero or one ObjetivoDetalle that matches the filter.
     * @param {ObjetivoDetalleFindUniqueArgs} args - Arguments to find a ObjetivoDetalle
     * @example
     * // Get one ObjetivoDetalle
     * const objetivoDetalle = await prisma.objetivoDetalle.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ObjetivoDetalleFindUniqueArgs>(args: SelectSubset<T, ObjetivoDetalleFindUniqueArgs<ExtArgs>>): Prisma__ObjetivoDetalleClient<$Result.GetResult<Prisma.$ObjetivoDetallePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ObjetivoDetalle that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ObjetivoDetalleFindUniqueOrThrowArgs} args - Arguments to find a ObjetivoDetalle
     * @example
     * // Get one ObjetivoDetalle
     * const objetivoDetalle = await prisma.objetivoDetalle.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ObjetivoDetalleFindUniqueOrThrowArgs>(args: SelectSubset<T, ObjetivoDetalleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ObjetivoDetalleClient<$Result.GetResult<Prisma.$ObjetivoDetallePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ObjetivoDetalle that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ObjetivoDetalleFindFirstArgs} args - Arguments to find a ObjetivoDetalle
     * @example
     * // Get one ObjetivoDetalle
     * const objetivoDetalle = await prisma.objetivoDetalle.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ObjetivoDetalleFindFirstArgs>(args?: SelectSubset<T, ObjetivoDetalleFindFirstArgs<ExtArgs>>): Prisma__ObjetivoDetalleClient<$Result.GetResult<Prisma.$ObjetivoDetallePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ObjetivoDetalle that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ObjetivoDetalleFindFirstOrThrowArgs} args - Arguments to find a ObjetivoDetalle
     * @example
     * // Get one ObjetivoDetalle
     * const objetivoDetalle = await prisma.objetivoDetalle.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ObjetivoDetalleFindFirstOrThrowArgs>(args?: SelectSubset<T, ObjetivoDetalleFindFirstOrThrowArgs<ExtArgs>>): Prisma__ObjetivoDetalleClient<$Result.GetResult<Prisma.$ObjetivoDetallePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ObjetivoDetalles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ObjetivoDetalleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ObjetivoDetalles
     * const objetivoDetalles = await prisma.objetivoDetalle.findMany()
     * 
     * // Get first 10 ObjetivoDetalles
     * const objetivoDetalles = await prisma.objetivoDetalle.findMany({ take: 10 })
     * 
     * // Only select the `idObjetivoDetalle`
     * const objetivoDetalleWithIdObjetivoDetalleOnly = await prisma.objetivoDetalle.findMany({ select: { idObjetivoDetalle: true } })
     * 
     */
    findMany<T extends ObjetivoDetalleFindManyArgs>(args?: SelectSubset<T, ObjetivoDetalleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ObjetivoDetallePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ObjetivoDetalle.
     * @param {ObjetivoDetalleCreateArgs} args - Arguments to create a ObjetivoDetalle.
     * @example
     * // Create one ObjetivoDetalle
     * const ObjetivoDetalle = await prisma.objetivoDetalle.create({
     *   data: {
     *     // ... data to create a ObjetivoDetalle
     *   }
     * })
     * 
     */
    create<T extends ObjetivoDetalleCreateArgs>(args: SelectSubset<T, ObjetivoDetalleCreateArgs<ExtArgs>>): Prisma__ObjetivoDetalleClient<$Result.GetResult<Prisma.$ObjetivoDetallePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ObjetivoDetalles.
     * @param {ObjetivoDetalleCreateManyArgs} args - Arguments to create many ObjetivoDetalles.
     * @example
     * // Create many ObjetivoDetalles
     * const objetivoDetalle = await prisma.objetivoDetalle.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ObjetivoDetalleCreateManyArgs>(args?: SelectSubset<T, ObjetivoDetalleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ObjetivoDetalles and returns the data saved in the database.
     * @param {ObjetivoDetalleCreateManyAndReturnArgs} args - Arguments to create many ObjetivoDetalles.
     * @example
     * // Create many ObjetivoDetalles
     * const objetivoDetalle = await prisma.objetivoDetalle.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ObjetivoDetalles and only return the `idObjetivoDetalle`
     * const objetivoDetalleWithIdObjetivoDetalleOnly = await prisma.objetivoDetalle.createManyAndReturn({
     *   select: { idObjetivoDetalle: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ObjetivoDetalleCreateManyAndReturnArgs>(args?: SelectSubset<T, ObjetivoDetalleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ObjetivoDetallePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ObjetivoDetalle.
     * @param {ObjetivoDetalleDeleteArgs} args - Arguments to delete one ObjetivoDetalle.
     * @example
     * // Delete one ObjetivoDetalle
     * const ObjetivoDetalle = await prisma.objetivoDetalle.delete({
     *   where: {
     *     // ... filter to delete one ObjetivoDetalle
     *   }
     * })
     * 
     */
    delete<T extends ObjetivoDetalleDeleteArgs>(args: SelectSubset<T, ObjetivoDetalleDeleteArgs<ExtArgs>>): Prisma__ObjetivoDetalleClient<$Result.GetResult<Prisma.$ObjetivoDetallePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ObjetivoDetalle.
     * @param {ObjetivoDetalleUpdateArgs} args - Arguments to update one ObjetivoDetalle.
     * @example
     * // Update one ObjetivoDetalle
     * const objetivoDetalle = await prisma.objetivoDetalle.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ObjetivoDetalleUpdateArgs>(args: SelectSubset<T, ObjetivoDetalleUpdateArgs<ExtArgs>>): Prisma__ObjetivoDetalleClient<$Result.GetResult<Prisma.$ObjetivoDetallePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ObjetivoDetalles.
     * @param {ObjetivoDetalleDeleteManyArgs} args - Arguments to filter ObjetivoDetalles to delete.
     * @example
     * // Delete a few ObjetivoDetalles
     * const { count } = await prisma.objetivoDetalle.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ObjetivoDetalleDeleteManyArgs>(args?: SelectSubset<T, ObjetivoDetalleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ObjetivoDetalles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ObjetivoDetalleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ObjetivoDetalles
     * const objetivoDetalle = await prisma.objetivoDetalle.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ObjetivoDetalleUpdateManyArgs>(args: SelectSubset<T, ObjetivoDetalleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ObjetivoDetalles and returns the data updated in the database.
     * @param {ObjetivoDetalleUpdateManyAndReturnArgs} args - Arguments to update many ObjetivoDetalles.
     * @example
     * // Update many ObjetivoDetalles
     * const objetivoDetalle = await prisma.objetivoDetalle.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ObjetivoDetalles and only return the `idObjetivoDetalle`
     * const objetivoDetalleWithIdObjetivoDetalleOnly = await prisma.objetivoDetalle.updateManyAndReturn({
     *   select: { idObjetivoDetalle: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ObjetivoDetalleUpdateManyAndReturnArgs>(args: SelectSubset<T, ObjetivoDetalleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ObjetivoDetallePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ObjetivoDetalle.
     * @param {ObjetivoDetalleUpsertArgs} args - Arguments to update or create a ObjetivoDetalle.
     * @example
     * // Update or create a ObjetivoDetalle
     * const objetivoDetalle = await prisma.objetivoDetalle.upsert({
     *   create: {
     *     // ... data to create a ObjetivoDetalle
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ObjetivoDetalle we want to update
     *   }
     * })
     */
    upsert<T extends ObjetivoDetalleUpsertArgs>(args: SelectSubset<T, ObjetivoDetalleUpsertArgs<ExtArgs>>): Prisma__ObjetivoDetalleClient<$Result.GetResult<Prisma.$ObjetivoDetallePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ObjetivoDetalles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ObjetivoDetalleCountArgs} args - Arguments to filter ObjetivoDetalles to count.
     * @example
     * // Count the number of ObjetivoDetalles
     * const count = await prisma.objetivoDetalle.count({
     *   where: {
     *     // ... the filter for the ObjetivoDetalles we want to count
     *   }
     * })
    **/
    count<T extends ObjetivoDetalleCountArgs>(
      args?: Subset<T, ObjetivoDetalleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ObjetivoDetalleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ObjetivoDetalle.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ObjetivoDetalleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ObjetivoDetalleAggregateArgs>(args: Subset<T, ObjetivoDetalleAggregateArgs>): Prisma.PrismaPromise<GetObjetivoDetalleAggregateType<T>>

    /**
     * Group by ObjetivoDetalle.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ObjetivoDetalleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ObjetivoDetalleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ObjetivoDetalleGroupByArgs['orderBy'] }
        : { orderBy?: ObjetivoDetalleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ObjetivoDetalleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetObjetivoDetalleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ObjetivoDetalle model
   */
  readonly fields: ObjetivoDetalleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ObjetivoDetalle.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ObjetivoDetalleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    objetivo<T extends ObjetivoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ObjetivoDefaultArgs<ExtArgs>>): Prisma__ObjetivoClient<$Result.GetResult<Prisma.$ObjetivoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ObjetivoDetalle model
   */
  interface ObjetivoDetalleFieldRefs {
    readonly idObjetivoDetalle: FieldRef<"ObjetivoDetalle", 'Int'>
    readonly idObjetivo: FieldRef<"ObjetivoDetalle", 'Int'>
    readonly secuencial: FieldRef<"ObjetivoDetalle", 'Int'>
    readonly descripcion: FieldRef<"ObjetivoDetalle", 'String'>
    readonly descripcionIniciativa: FieldRef<"ObjetivoDetalle", 'String'>
    readonly unidadMedida: FieldRef<"ObjetivoDetalle", 'String'>
    readonly pesoEspecifico: FieldRef<"ObjetivoDetalle", 'Float'>
    readonly estado: FieldRef<"ObjetivoDetalle", 'Boolean'>
    readonly creadoPorId: FieldRef<"ObjetivoDetalle", 'Int'>
    readonly actualizadoPorId: FieldRef<"ObjetivoDetalle", 'Int'>
    readonly fechaCreacion: FieldRef<"ObjetivoDetalle", 'DateTime'>
    readonly fechaModificacion: FieldRef<"ObjetivoDetalle", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ObjetivoDetalle findUnique
   */
  export type ObjetivoDetalleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ObjetivoDetalle
     */
    select?: ObjetivoDetalleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ObjetivoDetalle
     */
    omit?: ObjetivoDetalleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoDetalleInclude<ExtArgs> | null
    /**
     * Filter, which ObjetivoDetalle to fetch.
     */
    where: ObjetivoDetalleWhereUniqueInput
  }

  /**
   * ObjetivoDetalle findUniqueOrThrow
   */
  export type ObjetivoDetalleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ObjetivoDetalle
     */
    select?: ObjetivoDetalleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ObjetivoDetalle
     */
    omit?: ObjetivoDetalleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoDetalleInclude<ExtArgs> | null
    /**
     * Filter, which ObjetivoDetalle to fetch.
     */
    where: ObjetivoDetalleWhereUniqueInput
  }

  /**
   * ObjetivoDetalle findFirst
   */
  export type ObjetivoDetalleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ObjetivoDetalle
     */
    select?: ObjetivoDetalleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ObjetivoDetalle
     */
    omit?: ObjetivoDetalleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoDetalleInclude<ExtArgs> | null
    /**
     * Filter, which ObjetivoDetalle to fetch.
     */
    where?: ObjetivoDetalleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ObjetivoDetalles to fetch.
     */
    orderBy?: ObjetivoDetalleOrderByWithRelationInput | ObjetivoDetalleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ObjetivoDetalles.
     */
    cursor?: ObjetivoDetalleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ObjetivoDetalles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ObjetivoDetalles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ObjetivoDetalles.
     */
    distinct?: ObjetivoDetalleScalarFieldEnum | ObjetivoDetalleScalarFieldEnum[]
  }

  /**
   * ObjetivoDetalle findFirstOrThrow
   */
  export type ObjetivoDetalleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ObjetivoDetalle
     */
    select?: ObjetivoDetalleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ObjetivoDetalle
     */
    omit?: ObjetivoDetalleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoDetalleInclude<ExtArgs> | null
    /**
     * Filter, which ObjetivoDetalle to fetch.
     */
    where?: ObjetivoDetalleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ObjetivoDetalles to fetch.
     */
    orderBy?: ObjetivoDetalleOrderByWithRelationInput | ObjetivoDetalleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ObjetivoDetalles.
     */
    cursor?: ObjetivoDetalleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ObjetivoDetalles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ObjetivoDetalles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ObjetivoDetalles.
     */
    distinct?: ObjetivoDetalleScalarFieldEnum | ObjetivoDetalleScalarFieldEnum[]
  }

  /**
   * ObjetivoDetalle findMany
   */
  export type ObjetivoDetalleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ObjetivoDetalle
     */
    select?: ObjetivoDetalleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ObjetivoDetalle
     */
    omit?: ObjetivoDetalleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoDetalleInclude<ExtArgs> | null
    /**
     * Filter, which ObjetivoDetalles to fetch.
     */
    where?: ObjetivoDetalleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ObjetivoDetalles to fetch.
     */
    orderBy?: ObjetivoDetalleOrderByWithRelationInput | ObjetivoDetalleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ObjetivoDetalles.
     */
    cursor?: ObjetivoDetalleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ObjetivoDetalles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ObjetivoDetalles.
     */
    skip?: number
    distinct?: ObjetivoDetalleScalarFieldEnum | ObjetivoDetalleScalarFieldEnum[]
  }

  /**
   * ObjetivoDetalle create
   */
  export type ObjetivoDetalleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ObjetivoDetalle
     */
    select?: ObjetivoDetalleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ObjetivoDetalle
     */
    omit?: ObjetivoDetalleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoDetalleInclude<ExtArgs> | null
    /**
     * The data needed to create a ObjetivoDetalle.
     */
    data: XOR<ObjetivoDetalleCreateInput, ObjetivoDetalleUncheckedCreateInput>
  }

  /**
   * ObjetivoDetalle createMany
   */
  export type ObjetivoDetalleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ObjetivoDetalles.
     */
    data: ObjetivoDetalleCreateManyInput | ObjetivoDetalleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ObjetivoDetalle createManyAndReturn
   */
  export type ObjetivoDetalleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ObjetivoDetalle
     */
    select?: ObjetivoDetalleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ObjetivoDetalle
     */
    omit?: ObjetivoDetalleOmit<ExtArgs> | null
    /**
     * The data used to create many ObjetivoDetalles.
     */
    data: ObjetivoDetalleCreateManyInput | ObjetivoDetalleCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoDetalleIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ObjetivoDetalle update
   */
  export type ObjetivoDetalleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ObjetivoDetalle
     */
    select?: ObjetivoDetalleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ObjetivoDetalle
     */
    omit?: ObjetivoDetalleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoDetalleInclude<ExtArgs> | null
    /**
     * The data needed to update a ObjetivoDetalle.
     */
    data: XOR<ObjetivoDetalleUpdateInput, ObjetivoDetalleUncheckedUpdateInput>
    /**
     * Choose, which ObjetivoDetalle to update.
     */
    where: ObjetivoDetalleWhereUniqueInput
  }

  /**
   * ObjetivoDetalle updateMany
   */
  export type ObjetivoDetalleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ObjetivoDetalles.
     */
    data: XOR<ObjetivoDetalleUpdateManyMutationInput, ObjetivoDetalleUncheckedUpdateManyInput>
    /**
     * Filter which ObjetivoDetalles to update
     */
    where?: ObjetivoDetalleWhereInput
    /**
     * Limit how many ObjetivoDetalles to update.
     */
    limit?: number
  }

  /**
   * ObjetivoDetalle updateManyAndReturn
   */
  export type ObjetivoDetalleUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ObjetivoDetalle
     */
    select?: ObjetivoDetalleSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ObjetivoDetalle
     */
    omit?: ObjetivoDetalleOmit<ExtArgs> | null
    /**
     * The data used to update ObjetivoDetalles.
     */
    data: XOR<ObjetivoDetalleUpdateManyMutationInput, ObjetivoDetalleUncheckedUpdateManyInput>
    /**
     * Filter which ObjetivoDetalles to update
     */
    where?: ObjetivoDetalleWhereInput
    /**
     * Limit how many ObjetivoDetalles to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoDetalleIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ObjetivoDetalle upsert
   */
  export type ObjetivoDetalleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ObjetivoDetalle
     */
    select?: ObjetivoDetalleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ObjetivoDetalle
     */
    omit?: ObjetivoDetalleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoDetalleInclude<ExtArgs> | null
    /**
     * The filter to search for the ObjetivoDetalle to update in case it exists.
     */
    where: ObjetivoDetalleWhereUniqueInput
    /**
     * In case the ObjetivoDetalle found by the `where` argument doesn't exist, create a new ObjetivoDetalle with this data.
     */
    create: XOR<ObjetivoDetalleCreateInput, ObjetivoDetalleUncheckedCreateInput>
    /**
     * In case the ObjetivoDetalle was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ObjetivoDetalleUpdateInput, ObjetivoDetalleUncheckedUpdateInput>
  }

  /**
   * ObjetivoDetalle delete
   */
  export type ObjetivoDetalleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ObjetivoDetalle
     */
    select?: ObjetivoDetalleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ObjetivoDetalle
     */
    omit?: ObjetivoDetalleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoDetalleInclude<ExtArgs> | null
    /**
     * Filter which ObjetivoDetalle to delete.
     */
    where: ObjetivoDetalleWhereUniqueInput
  }

  /**
   * ObjetivoDetalle deleteMany
   */
  export type ObjetivoDetalleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ObjetivoDetalles to delete
     */
    where?: ObjetivoDetalleWhereInput
    /**
     * Limit how many ObjetivoDetalles to delete.
     */
    limit?: number
  }

  /**
   * ObjetivoDetalle without action
   */
  export type ObjetivoDetalleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ObjetivoDetalle
     */
    select?: ObjetivoDetalleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ObjetivoDetalle
     */
    omit?: ObjetivoDetalleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoDetalleInclude<ExtArgs> | null
  }


  /**
   * Model TablaMaestra
   */

  export type AggregateTablaMaestra = {
    _count: TablaMaestraCountAggregateOutputType | null
    _avg: TablaMaestraAvgAggregateOutputType | null
    _sum: TablaMaestraSumAggregateOutputType | null
    _min: TablaMaestraMinAggregateOutputType | null
    _max: TablaMaestraMaxAggregateOutputType | null
  }

  export type TablaMaestraAvgAggregateOutputType = {
    idTablaMaestra: number | null
    creadoPorId: number | null
    actualizadoPorId: number | null
  }

  export type TablaMaestraSumAggregateOutputType = {
    idTablaMaestra: number | null
    creadoPorId: number | null
    actualizadoPorId: number | null
  }

  export type TablaMaestraMinAggregateOutputType = {
    idTablaMaestra: number | null
    descripcion: string | null
    estado: boolean | null
    creadoPorId: number | null
    actualizadoPorId: number | null
    fechaCreacion: Date | null
    fechaModificacion: Date | null
  }

  export type TablaMaestraMaxAggregateOutputType = {
    idTablaMaestra: number | null
    descripcion: string | null
    estado: boolean | null
    creadoPorId: number | null
    actualizadoPorId: number | null
    fechaCreacion: Date | null
    fechaModificacion: Date | null
  }

  export type TablaMaestraCountAggregateOutputType = {
    idTablaMaestra: number
    descripcion: number
    estado: number
    creadoPorId: number
    actualizadoPorId: number
    fechaCreacion: number
    fechaModificacion: number
    _all: number
  }


  export type TablaMaestraAvgAggregateInputType = {
    idTablaMaestra?: true
    creadoPorId?: true
    actualizadoPorId?: true
  }

  export type TablaMaestraSumAggregateInputType = {
    idTablaMaestra?: true
    creadoPorId?: true
    actualizadoPorId?: true
  }

  export type TablaMaestraMinAggregateInputType = {
    idTablaMaestra?: true
    descripcion?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
  }

  export type TablaMaestraMaxAggregateInputType = {
    idTablaMaestra?: true
    descripcion?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
  }

  export type TablaMaestraCountAggregateInputType = {
    idTablaMaestra?: true
    descripcion?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
    _all?: true
  }

  export type TablaMaestraAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TablaMaestra to aggregate.
     */
    where?: TablaMaestraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TablaMaestras to fetch.
     */
    orderBy?: TablaMaestraOrderByWithRelationInput | TablaMaestraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TablaMaestraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TablaMaestras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TablaMaestras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TablaMaestras
    **/
    _count?: true | TablaMaestraCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TablaMaestraAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TablaMaestraSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TablaMaestraMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TablaMaestraMaxAggregateInputType
  }

  export type GetTablaMaestraAggregateType<T extends TablaMaestraAggregateArgs> = {
        [P in keyof T & keyof AggregateTablaMaestra]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTablaMaestra[P]>
      : GetScalarType<T[P], AggregateTablaMaestra[P]>
  }




  export type TablaMaestraGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TablaMaestraWhereInput
    orderBy?: TablaMaestraOrderByWithAggregationInput | TablaMaestraOrderByWithAggregationInput[]
    by: TablaMaestraScalarFieldEnum[] | TablaMaestraScalarFieldEnum
    having?: TablaMaestraScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TablaMaestraCountAggregateInputType | true
    _avg?: TablaMaestraAvgAggregateInputType
    _sum?: TablaMaestraSumAggregateInputType
    _min?: TablaMaestraMinAggregateInputType
    _max?: TablaMaestraMaxAggregateInputType
  }

  export type TablaMaestraGroupByOutputType = {
    idTablaMaestra: number
    descripcion: string | null
    estado: boolean
    creadoPorId: number
    actualizadoPorId: number | null
    fechaCreacion: Date
    fechaModificacion: Date | null
    _count: TablaMaestraCountAggregateOutputType | null
    _avg: TablaMaestraAvgAggregateOutputType | null
    _sum: TablaMaestraSumAggregateOutputType | null
    _min: TablaMaestraMinAggregateOutputType | null
    _max: TablaMaestraMaxAggregateOutputType | null
  }

  type GetTablaMaestraGroupByPayload<T extends TablaMaestraGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TablaMaestraGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TablaMaestraGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TablaMaestraGroupByOutputType[P]>
            : GetScalarType<T[P], TablaMaestraGroupByOutputType[P]>
        }
      >
    >


  export type TablaMaestraSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idTablaMaestra?: boolean
    descripcion?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
    TablaMaestraDetalle?: boolean | TablaMaestra$TablaMaestraDetalleArgs<ExtArgs>
    _count?: boolean | TablaMaestraCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tablaMaestra"]>

  export type TablaMaestraSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idTablaMaestra?: boolean
    descripcion?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
  }, ExtArgs["result"]["tablaMaestra"]>

  export type TablaMaestraSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idTablaMaestra?: boolean
    descripcion?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
  }, ExtArgs["result"]["tablaMaestra"]>

  export type TablaMaestraSelectScalar = {
    idTablaMaestra?: boolean
    descripcion?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
  }

  export type TablaMaestraOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"idTablaMaestra" | "descripcion" | "estado" | "creadoPorId" | "actualizadoPorId" | "fechaCreacion" | "fechaModificacion", ExtArgs["result"]["tablaMaestra"]>
  export type TablaMaestraInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    TablaMaestraDetalle?: boolean | TablaMaestra$TablaMaestraDetalleArgs<ExtArgs>
    _count?: boolean | TablaMaestraCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TablaMaestraIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type TablaMaestraIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TablaMaestraPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TablaMaestra"
    objects: {
      TablaMaestraDetalle: Prisma.$TablaMaestraDetallePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      idTablaMaestra: number
      descripcion: string | null
      estado: boolean
      creadoPorId: number
      actualizadoPorId: number | null
      fechaCreacion: Date
      fechaModificacion: Date | null
    }, ExtArgs["result"]["tablaMaestra"]>
    composites: {}
  }

  type TablaMaestraGetPayload<S extends boolean | null | undefined | TablaMaestraDefaultArgs> = $Result.GetResult<Prisma.$TablaMaestraPayload, S>

  type TablaMaestraCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TablaMaestraFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TablaMaestraCountAggregateInputType | true
    }

  export interface TablaMaestraDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TablaMaestra'], meta: { name: 'TablaMaestra' } }
    /**
     * Find zero or one TablaMaestra that matches the filter.
     * @param {TablaMaestraFindUniqueArgs} args - Arguments to find a TablaMaestra
     * @example
     * // Get one TablaMaestra
     * const tablaMaestra = await prisma.tablaMaestra.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TablaMaestraFindUniqueArgs>(args: SelectSubset<T, TablaMaestraFindUniqueArgs<ExtArgs>>): Prisma__TablaMaestraClient<$Result.GetResult<Prisma.$TablaMaestraPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TablaMaestra that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TablaMaestraFindUniqueOrThrowArgs} args - Arguments to find a TablaMaestra
     * @example
     * // Get one TablaMaestra
     * const tablaMaestra = await prisma.tablaMaestra.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TablaMaestraFindUniqueOrThrowArgs>(args: SelectSubset<T, TablaMaestraFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TablaMaestraClient<$Result.GetResult<Prisma.$TablaMaestraPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TablaMaestra that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TablaMaestraFindFirstArgs} args - Arguments to find a TablaMaestra
     * @example
     * // Get one TablaMaestra
     * const tablaMaestra = await prisma.tablaMaestra.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TablaMaestraFindFirstArgs>(args?: SelectSubset<T, TablaMaestraFindFirstArgs<ExtArgs>>): Prisma__TablaMaestraClient<$Result.GetResult<Prisma.$TablaMaestraPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TablaMaestra that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TablaMaestraFindFirstOrThrowArgs} args - Arguments to find a TablaMaestra
     * @example
     * // Get one TablaMaestra
     * const tablaMaestra = await prisma.tablaMaestra.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TablaMaestraFindFirstOrThrowArgs>(args?: SelectSubset<T, TablaMaestraFindFirstOrThrowArgs<ExtArgs>>): Prisma__TablaMaestraClient<$Result.GetResult<Prisma.$TablaMaestraPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TablaMaestras that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TablaMaestraFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TablaMaestras
     * const tablaMaestras = await prisma.tablaMaestra.findMany()
     * 
     * // Get first 10 TablaMaestras
     * const tablaMaestras = await prisma.tablaMaestra.findMany({ take: 10 })
     * 
     * // Only select the `idTablaMaestra`
     * const tablaMaestraWithIdTablaMaestraOnly = await prisma.tablaMaestra.findMany({ select: { idTablaMaestra: true } })
     * 
     */
    findMany<T extends TablaMaestraFindManyArgs>(args?: SelectSubset<T, TablaMaestraFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TablaMaestraPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TablaMaestra.
     * @param {TablaMaestraCreateArgs} args - Arguments to create a TablaMaestra.
     * @example
     * // Create one TablaMaestra
     * const TablaMaestra = await prisma.tablaMaestra.create({
     *   data: {
     *     // ... data to create a TablaMaestra
     *   }
     * })
     * 
     */
    create<T extends TablaMaestraCreateArgs>(args: SelectSubset<T, TablaMaestraCreateArgs<ExtArgs>>): Prisma__TablaMaestraClient<$Result.GetResult<Prisma.$TablaMaestraPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TablaMaestras.
     * @param {TablaMaestraCreateManyArgs} args - Arguments to create many TablaMaestras.
     * @example
     * // Create many TablaMaestras
     * const tablaMaestra = await prisma.tablaMaestra.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TablaMaestraCreateManyArgs>(args?: SelectSubset<T, TablaMaestraCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TablaMaestras and returns the data saved in the database.
     * @param {TablaMaestraCreateManyAndReturnArgs} args - Arguments to create many TablaMaestras.
     * @example
     * // Create many TablaMaestras
     * const tablaMaestra = await prisma.tablaMaestra.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TablaMaestras and only return the `idTablaMaestra`
     * const tablaMaestraWithIdTablaMaestraOnly = await prisma.tablaMaestra.createManyAndReturn({
     *   select: { idTablaMaestra: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TablaMaestraCreateManyAndReturnArgs>(args?: SelectSubset<T, TablaMaestraCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TablaMaestraPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TablaMaestra.
     * @param {TablaMaestraDeleteArgs} args - Arguments to delete one TablaMaestra.
     * @example
     * // Delete one TablaMaestra
     * const TablaMaestra = await prisma.tablaMaestra.delete({
     *   where: {
     *     // ... filter to delete one TablaMaestra
     *   }
     * })
     * 
     */
    delete<T extends TablaMaestraDeleteArgs>(args: SelectSubset<T, TablaMaestraDeleteArgs<ExtArgs>>): Prisma__TablaMaestraClient<$Result.GetResult<Prisma.$TablaMaestraPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TablaMaestra.
     * @param {TablaMaestraUpdateArgs} args - Arguments to update one TablaMaestra.
     * @example
     * // Update one TablaMaestra
     * const tablaMaestra = await prisma.tablaMaestra.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TablaMaestraUpdateArgs>(args: SelectSubset<T, TablaMaestraUpdateArgs<ExtArgs>>): Prisma__TablaMaestraClient<$Result.GetResult<Prisma.$TablaMaestraPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TablaMaestras.
     * @param {TablaMaestraDeleteManyArgs} args - Arguments to filter TablaMaestras to delete.
     * @example
     * // Delete a few TablaMaestras
     * const { count } = await prisma.tablaMaestra.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TablaMaestraDeleteManyArgs>(args?: SelectSubset<T, TablaMaestraDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TablaMaestras.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TablaMaestraUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TablaMaestras
     * const tablaMaestra = await prisma.tablaMaestra.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TablaMaestraUpdateManyArgs>(args: SelectSubset<T, TablaMaestraUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TablaMaestras and returns the data updated in the database.
     * @param {TablaMaestraUpdateManyAndReturnArgs} args - Arguments to update many TablaMaestras.
     * @example
     * // Update many TablaMaestras
     * const tablaMaestra = await prisma.tablaMaestra.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TablaMaestras and only return the `idTablaMaestra`
     * const tablaMaestraWithIdTablaMaestraOnly = await prisma.tablaMaestra.updateManyAndReturn({
     *   select: { idTablaMaestra: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TablaMaestraUpdateManyAndReturnArgs>(args: SelectSubset<T, TablaMaestraUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TablaMaestraPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TablaMaestra.
     * @param {TablaMaestraUpsertArgs} args - Arguments to update or create a TablaMaestra.
     * @example
     * // Update or create a TablaMaestra
     * const tablaMaestra = await prisma.tablaMaestra.upsert({
     *   create: {
     *     // ... data to create a TablaMaestra
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TablaMaestra we want to update
     *   }
     * })
     */
    upsert<T extends TablaMaestraUpsertArgs>(args: SelectSubset<T, TablaMaestraUpsertArgs<ExtArgs>>): Prisma__TablaMaestraClient<$Result.GetResult<Prisma.$TablaMaestraPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TablaMaestras.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TablaMaestraCountArgs} args - Arguments to filter TablaMaestras to count.
     * @example
     * // Count the number of TablaMaestras
     * const count = await prisma.tablaMaestra.count({
     *   where: {
     *     // ... the filter for the TablaMaestras we want to count
     *   }
     * })
    **/
    count<T extends TablaMaestraCountArgs>(
      args?: Subset<T, TablaMaestraCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TablaMaestraCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TablaMaestra.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TablaMaestraAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TablaMaestraAggregateArgs>(args: Subset<T, TablaMaestraAggregateArgs>): Prisma.PrismaPromise<GetTablaMaestraAggregateType<T>>

    /**
     * Group by TablaMaestra.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TablaMaestraGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TablaMaestraGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TablaMaestraGroupByArgs['orderBy'] }
        : { orderBy?: TablaMaestraGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TablaMaestraGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTablaMaestraGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TablaMaestra model
   */
  readonly fields: TablaMaestraFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TablaMaestra.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TablaMaestraClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    TablaMaestraDetalle<T extends TablaMaestra$TablaMaestraDetalleArgs<ExtArgs> = {}>(args?: Subset<T, TablaMaestra$TablaMaestraDetalleArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TablaMaestraDetallePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TablaMaestra model
   */
  interface TablaMaestraFieldRefs {
    readonly idTablaMaestra: FieldRef<"TablaMaestra", 'Int'>
    readonly descripcion: FieldRef<"TablaMaestra", 'String'>
    readonly estado: FieldRef<"TablaMaestra", 'Boolean'>
    readonly creadoPorId: FieldRef<"TablaMaestra", 'Int'>
    readonly actualizadoPorId: FieldRef<"TablaMaestra", 'Int'>
    readonly fechaCreacion: FieldRef<"TablaMaestra", 'DateTime'>
    readonly fechaModificacion: FieldRef<"TablaMaestra", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TablaMaestra findUnique
   */
  export type TablaMaestraFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TablaMaestra
     */
    select?: TablaMaestraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TablaMaestra
     */
    omit?: TablaMaestraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TablaMaestraInclude<ExtArgs> | null
    /**
     * Filter, which TablaMaestra to fetch.
     */
    where: TablaMaestraWhereUniqueInput
  }

  /**
   * TablaMaestra findUniqueOrThrow
   */
  export type TablaMaestraFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TablaMaestra
     */
    select?: TablaMaestraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TablaMaestra
     */
    omit?: TablaMaestraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TablaMaestraInclude<ExtArgs> | null
    /**
     * Filter, which TablaMaestra to fetch.
     */
    where: TablaMaestraWhereUniqueInput
  }

  /**
   * TablaMaestra findFirst
   */
  export type TablaMaestraFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TablaMaestra
     */
    select?: TablaMaestraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TablaMaestra
     */
    omit?: TablaMaestraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TablaMaestraInclude<ExtArgs> | null
    /**
     * Filter, which TablaMaestra to fetch.
     */
    where?: TablaMaestraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TablaMaestras to fetch.
     */
    orderBy?: TablaMaestraOrderByWithRelationInput | TablaMaestraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TablaMaestras.
     */
    cursor?: TablaMaestraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TablaMaestras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TablaMaestras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TablaMaestras.
     */
    distinct?: TablaMaestraScalarFieldEnum | TablaMaestraScalarFieldEnum[]
  }

  /**
   * TablaMaestra findFirstOrThrow
   */
  export type TablaMaestraFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TablaMaestra
     */
    select?: TablaMaestraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TablaMaestra
     */
    omit?: TablaMaestraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TablaMaestraInclude<ExtArgs> | null
    /**
     * Filter, which TablaMaestra to fetch.
     */
    where?: TablaMaestraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TablaMaestras to fetch.
     */
    orderBy?: TablaMaestraOrderByWithRelationInput | TablaMaestraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TablaMaestras.
     */
    cursor?: TablaMaestraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TablaMaestras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TablaMaestras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TablaMaestras.
     */
    distinct?: TablaMaestraScalarFieldEnum | TablaMaestraScalarFieldEnum[]
  }

  /**
   * TablaMaestra findMany
   */
  export type TablaMaestraFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TablaMaestra
     */
    select?: TablaMaestraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TablaMaestra
     */
    omit?: TablaMaestraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TablaMaestraInclude<ExtArgs> | null
    /**
     * Filter, which TablaMaestras to fetch.
     */
    where?: TablaMaestraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TablaMaestras to fetch.
     */
    orderBy?: TablaMaestraOrderByWithRelationInput | TablaMaestraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TablaMaestras.
     */
    cursor?: TablaMaestraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TablaMaestras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TablaMaestras.
     */
    skip?: number
    distinct?: TablaMaestraScalarFieldEnum | TablaMaestraScalarFieldEnum[]
  }

  /**
   * TablaMaestra create
   */
  export type TablaMaestraCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TablaMaestra
     */
    select?: TablaMaestraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TablaMaestra
     */
    omit?: TablaMaestraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TablaMaestraInclude<ExtArgs> | null
    /**
     * The data needed to create a TablaMaestra.
     */
    data: XOR<TablaMaestraCreateInput, TablaMaestraUncheckedCreateInput>
  }

  /**
   * TablaMaestra createMany
   */
  export type TablaMaestraCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TablaMaestras.
     */
    data: TablaMaestraCreateManyInput | TablaMaestraCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TablaMaestra createManyAndReturn
   */
  export type TablaMaestraCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TablaMaestra
     */
    select?: TablaMaestraSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TablaMaestra
     */
    omit?: TablaMaestraOmit<ExtArgs> | null
    /**
     * The data used to create many TablaMaestras.
     */
    data: TablaMaestraCreateManyInput | TablaMaestraCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TablaMaestra update
   */
  export type TablaMaestraUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TablaMaestra
     */
    select?: TablaMaestraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TablaMaestra
     */
    omit?: TablaMaestraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TablaMaestraInclude<ExtArgs> | null
    /**
     * The data needed to update a TablaMaestra.
     */
    data: XOR<TablaMaestraUpdateInput, TablaMaestraUncheckedUpdateInput>
    /**
     * Choose, which TablaMaestra to update.
     */
    where: TablaMaestraWhereUniqueInput
  }

  /**
   * TablaMaestra updateMany
   */
  export type TablaMaestraUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TablaMaestras.
     */
    data: XOR<TablaMaestraUpdateManyMutationInput, TablaMaestraUncheckedUpdateManyInput>
    /**
     * Filter which TablaMaestras to update
     */
    where?: TablaMaestraWhereInput
    /**
     * Limit how many TablaMaestras to update.
     */
    limit?: number
  }

  /**
   * TablaMaestra updateManyAndReturn
   */
  export type TablaMaestraUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TablaMaestra
     */
    select?: TablaMaestraSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TablaMaestra
     */
    omit?: TablaMaestraOmit<ExtArgs> | null
    /**
     * The data used to update TablaMaestras.
     */
    data: XOR<TablaMaestraUpdateManyMutationInput, TablaMaestraUncheckedUpdateManyInput>
    /**
     * Filter which TablaMaestras to update
     */
    where?: TablaMaestraWhereInput
    /**
     * Limit how many TablaMaestras to update.
     */
    limit?: number
  }

  /**
   * TablaMaestra upsert
   */
  export type TablaMaestraUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TablaMaestra
     */
    select?: TablaMaestraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TablaMaestra
     */
    omit?: TablaMaestraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TablaMaestraInclude<ExtArgs> | null
    /**
     * The filter to search for the TablaMaestra to update in case it exists.
     */
    where: TablaMaestraWhereUniqueInput
    /**
     * In case the TablaMaestra found by the `where` argument doesn't exist, create a new TablaMaestra with this data.
     */
    create: XOR<TablaMaestraCreateInput, TablaMaestraUncheckedCreateInput>
    /**
     * In case the TablaMaestra was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TablaMaestraUpdateInput, TablaMaestraUncheckedUpdateInput>
  }

  /**
   * TablaMaestra delete
   */
  export type TablaMaestraDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TablaMaestra
     */
    select?: TablaMaestraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TablaMaestra
     */
    omit?: TablaMaestraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TablaMaestraInclude<ExtArgs> | null
    /**
     * Filter which TablaMaestra to delete.
     */
    where: TablaMaestraWhereUniqueInput
  }

  /**
   * TablaMaestra deleteMany
   */
  export type TablaMaestraDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TablaMaestras to delete
     */
    where?: TablaMaestraWhereInput
    /**
     * Limit how many TablaMaestras to delete.
     */
    limit?: number
  }

  /**
   * TablaMaestra.TablaMaestraDetalle
   */
  export type TablaMaestra$TablaMaestraDetalleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TablaMaestraDetalle
     */
    select?: TablaMaestraDetalleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TablaMaestraDetalle
     */
    omit?: TablaMaestraDetalleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TablaMaestraDetalleInclude<ExtArgs> | null
    where?: TablaMaestraDetalleWhereInput
    orderBy?: TablaMaestraDetalleOrderByWithRelationInput | TablaMaestraDetalleOrderByWithRelationInput[]
    cursor?: TablaMaestraDetalleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TablaMaestraDetalleScalarFieldEnum | TablaMaestraDetalleScalarFieldEnum[]
  }

  /**
   * TablaMaestra without action
   */
  export type TablaMaestraDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TablaMaestra
     */
    select?: TablaMaestraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TablaMaestra
     */
    omit?: TablaMaestraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TablaMaestraInclude<ExtArgs> | null
  }


  /**
   * Model TablaMaestraDetalle
   */

  export type AggregateTablaMaestraDetalle = {
    _count: TablaMaestraDetalleCountAggregateOutputType | null
    _avg: TablaMaestraDetalleAvgAggregateOutputType | null
    _sum: TablaMaestraDetalleSumAggregateOutputType | null
    _min: TablaMaestraDetalleMinAggregateOutputType | null
    _max: TablaMaestraDetalleMaxAggregateOutputType | null
  }

  export type TablaMaestraDetalleAvgAggregateOutputType = {
    idTablaMaestraDetalle: number | null
    idTablaMaestra: number | null
    creadoPorId: number | null
    actualizadoPorId: number | null
  }

  export type TablaMaestraDetalleSumAggregateOutputType = {
    idTablaMaestraDetalle: number | null
    idTablaMaestra: number | null
    creadoPorId: number | null
    actualizadoPorId: number | null
  }

  export type TablaMaestraDetalleMinAggregateOutputType = {
    idTablaMaestraDetalle: number | null
    descripcion: string | null
    valor: string | null
    idTablaMaestra: number | null
    estado: boolean | null
    creadoPorId: number | null
    actualizadoPorId: number | null
    fechaCreacion: Date | null
    fechaModificacion: Date | null
  }

  export type TablaMaestraDetalleMaxAggregateOutputType = {
    idTablaMaestraDetalle: number | null
    descripcion: string | null
    valor: string | null
    idTablaMaestra: number | null
    estado: boolean | null
    creadoPorId: number | null
    actualizadoPorId: number | null
    fechaCreacion: Date | null
    fechaModificacion: Date | null
  }

  export type TablaMaestraDetalleCountAggregateOutputType = {
    idTablaMaestraDetalle: number
    descripcion: number
    valor: number
    idTablaMaestra: number
    estado: number
    creadoPorId: number
    actualizadoPorId: number
    fechaCreacion: number
    fechaModificacion: number
    _all: number
  }


  export type TablaMaestraDetalleAvgAggregateInputType = {
    idTablaMaestraDetalle?: true
    idTablaMaestra?: true
    creadoPorId?: true
    actualizadoPorId?: true
  }

  export type TablaMaestraDetalleSumAggregateInputType = {
    idTablaMaestraDetalle?: true
    idTablaMaestra?: true
    creadoPorId?: true
    actualizadoPorId?: true
  }

  export type TablaMaestraDetalleMinAggregateInputType = {
    idTablaMaestraDetalle?: true
    descripcion?: true
    valor?: true
    idTablaMaestra?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
  }

  export type TablaMaestraDetalleMaxAggregateInputType = {
    idTablaMaestraDetalle?: true
    descripcion?: true
    valor?: true
    idTablaMaestra?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
  }

  export type TablaMaestraDetalleCountAggregateInputType = {
    idTablaMaestraDetalle?: true
    descripcion?: true
    valor?: true
    idTablaMaestra?: true
    estado?: true
    creadoPorId?: true
    actualizadoPorId?: true
    fechaCreacion?: true
    fechaModificacion?: true
    _all?: true
  }

  export type TablaMaestraDetalleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TablaMaestraDetalle to aggregate.
     */
    where?: TablaMaestraDetalleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TablaMaestraDetalles to fetch.
     */
    orderBy?: TablaMaestraDetalleOrderByWithRelationInput | TablaMaestraDetalleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TablaMaestraDetalleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TablaMaestraDetalles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TablaMaestraDetalles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TablaMaestraDetalles
    **/
    _count?: true | TablaMaestraDetalleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TablaMaestraDetalleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TablaMaestraDetalleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TablaMaestraDetalleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TablaMaestraDetalleMaxAggregateInputType
  }

  export type GetTablaMaestraDetalleAggregateType<T extends TablaMaestraDetalleAggregateArgs> = {
        [P in keyof T & keyof AggregateTablaMaestraDetalle]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTablaMaestraDetalle[P]>
      : GetScalarType<T[P], AggregateTablaMaestraDetalle[P]>
  }




  export type TablaMaestraDetalleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TablaMaestraDetalleWhereInput
    orderBy?: TablaMaestraDetalleOrderByWithAggregationInput | TablaMaestraDetalleOrderByWithAggregationInput[]
    by: TablaMaestraDetalleScalarFieldEnum[] | TablaMaestraDetalleScalarFieldEnum
    having?: TablaMaestraDetalleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TablaMaestraDetalleCountAggregateInputType | true
    _avg?: TablaMaestraDetalleAvgAggregateInputType
    _sum?: TablaMaestraDetalleSumAggregateInputType
    _min?: TablaMaestraDetalleMinAggregateInputType
    _max?: TablaMaestraDetalleMaxAggregateInputType
  }

  export type TablaMaestraDetalleGroupByOutputType = {
    idTablaMaestraDetalle: number
    descripcion: string | null
    valor: string | null
    idTablaMaestra: number
    estado: boolean
    creadoPorId: number
    actualizadoPorId: number | null
    fechaCreacion: Date
    fechaModificacion: Date | null
    _count: TablaMaestraDetalleCountAggregateOutputType | null
    _avg: TablaMaestraDetalleAvgAggregateOutputType | null
    _sum: TablaMaestraDetalleSumAggregateOutputType | null
    _min: TablaMaestraDetalleMinAggregateOutputType | null
    _max: TablaMaestraDetalleMaxAggregateOutputType | null
  }

  type GetTablaMaestraDetalleGroupByPayload<T extends TablaMaestraDetalleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TablaMaestraDetalleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TablaMaestraDetalleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TablaMaestraDetalleGroupByOutputType[P]>
            : GetScalarType<T[P], TablaMaestraDetalleGroupByOutputType[P]>
        }
      >
    >


  export type TablaMaestraDetalleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idTablaMaestraDetalle?: boolean
    descripcion?: boolean
    valor?: boolean
    idTablaMaestra?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
    tablaMaestra?: boolean | TablaMaestraDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tablaMaestraDetalle"]>

  export type TablaMaestraDetalleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idTablaMaestraDetalle?: boolean
    descripcion?: boolean
    valor?: boolean
    idTablaMaestra?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
    tablaMaestra?: boolean | TablaMaestraDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tablaMaestraDetalle"]>

  export type TablaMaestraDetalleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    idTablaMaestraDetalle?: boolean
    descripcion?: boolean
    valor?: boolean
    idTablaMaestra?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
    tablaMaestra?: boolean | TablaMaestraDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tablaMaestraDetalle"]>

  export type TablaMaestraDetalleSelectScalar = {
    idTablaMaestraDetalle?: boolean
    descripcion?: boolean
    valor?: boolean
    idTablaMaestra?: boolean
    estado?: boolean
    creadoPorId?: boolean
    actualizadoPorId?: boolean
    fechaCreacion?: boolean
    fechaModificacion?: boolean
  }

  export type TablaMaestraDetalleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"idTablaMaestraDetalle" | "descripcion" | "valor" | "idTablaMaestra" | "estado" | "creadoPorId" | "actualizadoPorId" | "fechaCreacion" | "fechaModificacion", ExtArgs["result"]["tablaMaestraDetalle"]>
  export type TablaMaestraDetalleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tablaMaestra?: boolean | TablaMaestraDefaultArgs<ExtArgs>
  }
  export type TablaMaestraDetalleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tablaMaestra?: boolean | TablaMaestraDefaultArgs<ExtArgs>
  }
  export type TablaMaestraDetalleIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tablaMaestra?: boolean | TablaMaestraDefaultArgs<ExtArgs>
  }

  export type $TablaMaestraDetallePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TablaMaestraDetalle"
    objects: {
      tablaMaestra: Prisma.$TablaMaestraPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      idTablaMaestraDetalle: number
      descripcion: string | null
      valor: string | null
      idTablaMaestra: number
      estado: boolean
      creadoPorId: number
      actualizadoPorId: number | null
      fechaCreacion: Date
      fechaModificacion: Date | null
    }, ExtArgs["result"]["tablaMaestraDetalle"]>
    composites: {}
  }

  type TablaMaestraDetalleGetPayload<S extends boolean | null | undefined | TablaMaestraDetalleDefaultArgs> = $Result.GetResult<Prisma.$TablaMaestraDetallePayload, S>

  type TablaMaestraDetalleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TablaMaestraDetalleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TablaMaestraDetalleCountAggregateInputType | true
    }

  export interface TablaMaestraDetalleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TablaMaestraDetalle'], meta: { name: 'TablaMaestraDetalle' } }
    /**
     * Find zero or one TablaMaestraDetalle that matches the filter.
     * @param {TablaMaestraDetalleFindUniqueArgs} args - Arguments to find a TablaMaestraDetalle
     * @example
     * // Get one TablaMaestraDetalle
     * const tablaMaestraDetalle = await prisma.tablaMaestraDetalle.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TablaMaestraDetalleFindUniqueArgs>(args: SelectSubset<T, TablaMaestraDetalleFindUniqueArgs<ExtArgs>>): Prisma__TablaMaestraDetalleClient<$Result.GetResult<Prisma.$TablaMaestraDetallePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TablaMaestraDetalle that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TablaMaestraDetalleFindUniqueOrThrowArgs} args - Arguments to find a TablaMaestraDetalle
     * @example
     * // Get one TablaMaestraDetalle
     * const tablaMaestraDetalle = await prisma.tablaMaestraDetalle.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TablaMaestraDetalleFindUniqueOrThrowArgs>(args: SelectSubset<T, TablaMaestraDetalleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TablaMaestraDetalleClient<$Result.GetResult<Prisma.$TablaMaestraDetallePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TablaMaestraDetalle that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TablaMaestraDetalleFindFirstArgs} args - Arguments to find a TablaMaestraDetalle
     * @example
     * // Get one TablaMaestraDetalle
     * const tablaMaestraDetalle = await prisma.tablaMaestraDetalle.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TablaMaestraDetalleFindFirstArgs>(args?: SelectSubset<T, TablaMaestraDetalleFindFirstArgs<ExtArgs>>): Prisma__TablaMaestraDetalleClient<$Result.GetResult<Prisma.$TablaMaestraDetallePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TablaMaestraDetalle that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TablaMaestraDetalleFindFirstOrThrowArgs} args - Arguments to find a TablaMaestraDetalle
     * @example
     * // Get one TablaMaestraDetalle
     * const tablaMaestraDetalle = await prisma.tablaMaestraDetalle.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TablaMaestraDetalleFindFirstOrThrowArgs>(args?: SelectSubset<T, TablaMaestraDetalleFindFirstOrThrowArgs<ExtArgs>>): Prisma__TablaMaestraDetalleClient<$Result.GetResult<Prisma.$TablaMaestraDetallePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TablaMaestraDetalles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TablaMaestraDetalleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TablaMaestraDetalles
     * const tablaMaestraDetalles = await prisma.tablaMaestraDetalle.findMany()
     * 
     * // Get first 10 TablaMaestraDetalles
     * const tablaMaestraDetalles = await prisma.tablaMaestraDetalle.findMany({ take: 10 })
     * 
     * // Only select the `idTablaMaestraDetalle`
     * const tablaMaestraDetalleWithIdTablaMaestraDetalleOnly = await prisma.tablaMaestraDetalle.findMany({ select: { idTablaMaestraDetalle: true } })
     * 
     */
    findMany<T extends TablaMaestraDetalleFindManyArgs>(args?: SelectSubset<T, TablaMaestraDetalleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TablaMaestraDetallePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TablaMaestraDetalle.
     * @param {TablaMaestraDetalleCreateArgs} args - Arguments to create a TablaMaestraDetalle.
     * @example
     * // Create one TablaMaestraDetalle
     * const TablaMaestraDetalle = await prisma.tablaMaestraDetalle.create({
     *   data: {
     *     // ... data to create a TablaMaestraDetalle
     *   }
     * })
     * 
     */
    create<T extends TablaMaestraDetalleCreateArgs>(args: SelectSubset<T, TablaMaestraDetalleCreateArgs<ExtArgs>>): Prisma__TablaMaestraDetalleClient<$Result.GetResult<Prisma.$TablaMaestraDetallePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TablaMaestraDetalles.
     * @param {TablaMaestraDetalleCreateManyArgs} args - Arguments to create many TablaMaestraDetalles.
     * @example
     * // Create many TablaMaestraDetalles
     * const tablaMaestraDetalle = await prisma.tablaMaestraDetalle.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TablaMaestraDetalleCreateManyArgs>(args?: SelectSubset<T, TablaMaestraDetalleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TablaMaestraDetalles and returns the data saved in the database.
     * @param {TablaMaestraDetalleCreateManyAndReturnArgs} args - Arguments to create many TablaMaestraDetalles.
     * @example
     * // Create many TablaMaestraDetalles
     * const tablaMaestraDetalle = await prisma.tablaMaestraDetalle.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TablaMaestraDetalles and only return the `idTablaMaestraDetalle`
     * const tablaMaestraDetalleWithIdTablaMaestraDetalleOnly = await prisma.tablaMaestraDetalle.createManyAndReturn({
     *   select: { idTablaMaestraDetalle: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TablaMaestraDetalleCreateManyAndReturnArgs>(args?: SelectSubset<T, TablaMaestraDetalleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TablaMaestraDetallePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TablaMaestraDetalle.
     * @param {TablaMaestraDetalleDeleteArgs} args - Arguments to delete one TablaMaestraDetalle.
     * @example
     * // Delete one TablaMaestraDetalle
     * const TablaMaestraDetalle = await prisma.tablaMaestraDetalle.delete({
     *   where: {
     *     // ... filter to delete one TablaMaestraDetalle
     *   }
     * })
     * 
     */
    delete<T extends TablaMaestraDetalleDeleteArgs>(args: SelectSubset<T, TablaMaestraDetalleDeleteArgs<ExtArgs>>): Prisma__TablaMaestraDetalleClient<$Result.GetResult<Prisma.$TablaMaestraDetallePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TablaMaestraDetalle.
     * @param {TablaMaestraDetalleUpdateArgs} args - Arguments to update one TablaMaestraDetalle.
     * @example
     * // Update one TablaMaestraDetalle
     * const tablaMaestraDetalle = await prisma.tablaMaestraDetalle.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TablaMaestraDetalleUpdateArgs>(args: SelectSubset<T, TablaMaestraDetalleUpdateArgs<ExtArgs>>): Prisma__TablaMaestraDetalleClient<$Result.GetResult<Prisma.$TablaMaestraDetallePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TablaMaestraDetalles.
     * @param {TablaMaestraDetalleDeleteManyArgs} args - Arguments to filter TablaMaestraDetalles to delete.
     * @example
     * // Delete a few TablaMaestraDetalles
     * const { count } = await prisma.tablaMaestraDetalle.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TablaMaestraDetalleDeleteManyArgs>(args?: SelectSubset<T, TablaMaestraDetalleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TablaMaestraDetalles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TablaMaestraDetalleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TablaMaestraDetalles
     * const tablaMaestraDetalle = await prisma.tablaMaestraDetalle.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TablaMaestraDetalleUpdateManyArgs>(args: SelectSubset<T, TablaMaestraDetalleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TablaMaestraDetalles and returns the data updated in the database.
     * @param {TablaMaestraDetalleUpdateManyAndReturnArgs} args - Arguments to update many TablaMaestraDetalles.
     * @example
     * // Update many TablaMaestraDetalles
     * const tablaMaestraDetalle = await prisma.tablaMaestraDetalle.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TablaMaestraDetalles and only return the `idTablaMaestraDetalle`
     * const tablaMaestraDetalleWithIdTablaMaestraDetalleOnly = await prisma.tablaMaestraDetalle.updateManyAndReturn({
     *   select: { idTablaMaestraDetalle: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TablaMaestraDetalleUpdateManyAndReturnArgs>(args: SelectSubset<T, TablaMaestraDetalleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TablaMaestraDetallePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TablaMaestraDetalle.
     * @param {TablaMaestraDetalleUpsertArgs} args - Arguments to update or create a TablaMaestraDetalle.
     * @example
     * // Update or create a TablaMaestraDetalle
     * const tablaMaestraDetalle = await prisma.tablaMaestraDetalle.upsert({
     *   create: {
     *     // ... data to create a TablaMaestraDetalle
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TablaMaestraDetalle we want to update
     *   }
     * })
     */
    upsert<T extends TablaMaestraDetalleUpsertArgs>(args: SelectSubset<T, TablaMaestraDetalleUpsertArgs<ExtArgs>>): Prisma__TablaMaestraDetalleClient<$Result.GetResult<Prisma.$TablaMaestraDetallePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TablaMaestraDetalles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TablaMaestraDetalleCountArgs} args - Arguments to filter TablaMaestraDetalles to count.
     * @example
     * // Count the number of TablaMaestraDetalles
     * const count = await prisma.tablaMaestraDetalle.count({
     *   where: {
     *     // ... the filter for the TablaMaestraDetalles we want to count
     *   }
     * })
    **/
    count<T extends TablaMaestraDetalleCountArgs>(
      args?: Subset<T, TablaMaestraDetalleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TablaMaestraDetalleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TablaMaestraDetalle.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TablaMaestraDetalleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TablaMaestraDetalleAggregateArgs>(args: Subset<T, TablaMaestraDetalleAggregateArgs>): Prisma.PrismaPromise<GetTablaMaestraDetalleAggregateType<T>>

    /**
     * Group by TablaMaestraDetalle.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TablaMaestraDetalleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TablaMaestraDetalleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TablaMaestraDetalleGroupByArgs['orderBy'] }
        : { orderBy?: TablaMaestraDetalleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TablaMaestraDetalleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTablaMaestraDetalleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TablaMaestraDetalle model
   */
  readonly fields: TablaMaestraDetalleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TablaMaestraDetalle.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TablaMaestraDetalleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tablaMaestra<T extends TablaMaestraDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TablaMaestraDefaultArgs<ExtArgs>>): Prisma__TablaMaestraClient<$Result.GetResult<Prisma.$TablaMaestraPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TablaMaestraDetalle model
   */
  interface TablaMaestraDetalleFieldRefs {
    readonly idTablaMaestraDetalle: FieldRef<"TablaMaestraDetalle", 'Int'>
    readonly descripcion: FieldRef<"TablaMaestraDetalle", 'String'>
    readonly valor: FieldRef<"TablaMaestraDetalle", 'String'>
    readonly idTablaMaestra: FieldRef<"TablaMaestraDetalle", 'Int'>
    readonly estado: FieldRef<"TablaMaestraDetalle", 'Boolean'>
    readonly creadoPorId: FieldRef<"TablaMaestraDetalle", 'Int'>
    readonly actualizadoPorId: FieldRef<"TablaMaestraDetalle", 'Int'>
    readonly fechaCreacion: FieldRef<"TablaMaestraDetalle", 'DateTime'>
    readonly fechaModificacion: FieldRef<"TablaMaestraDetalle", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TablaMaestraDetalle findUnique
   */
  export type TablaMaestraDetalleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TablaMaestraDetalle
     */
    select?: TablaMaestraDetalleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TablaMaestraDetalle
     */
    omit?: TablaMaestraDetalleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TablaMaestraDetalleInclude<ExtArgs> | null
    /**
     * Filter, which TablaMaestraDetalle to fetch.
     */
    where: TablaMaestraDetalleWhereUniqueInput
  }

  /**
   * TablaMaestraDetalle findUniqueOrThrow
   */
  export type TablaMaestraDetalleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TablaMaestraDetalle
     */
    select?: TablaMaestraDetalleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TablaMaestraDetalle
     */
    omit?: TablaMaestraDetalleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TablaMaestraDetalleInclude<ExtArgs> | null
    /**
     * Filter, which TablaMaestraDetalle to fetch.
     */
    where: TablaMaestraDetalleWhereUniqueInput
  }

  /**
   * TablaMaestraDetalle findFirst
   */
  export type TablaMaestraDetalleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TablaMaestraDetalle
     */
    select?: TablaMaestraDetalleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TablaMaestraDetalle
     */
    omit?: TablaMaestraDetalleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TablaMaestraDetalleInclude<ExtArgs> | null
    /**
     * Filter, which TablaMaestraDetalle to fetch.
     */
    where?: TablaMaestraDetalleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TablaMaestraDetalles to fetch.
     */
    orderBy?: TablaMaestraDetalleOrderByWithRelationInput | TablaMaestraDetalleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TablaMaestraDetalles.
     */
    cursor?: TablaMaestraDetalleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TablaMaestraDetalles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TablaMaestraDetalles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TablaMaestraDetalles.
     */
    distinct?: TablaMaestraDetalleScalarFieldEnum | TablaMaestraDetalleScalarFieldEnum[]
  }

  /**
   * TablaMaestraDetalle findFirstOrThrow
   */
  export type TablaMaestraDetalleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TablaMaestraDetalle
     */
    select?: TablaMaestraDetalleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TablaMaestraDetalle
     */
    omit?: TablaMaestraDetalleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TablaMaestraDetalleInclude<ExtArgs> | null
    /**
     * Filter, which TablaMaestraDetalle to fetch.
     */
    where?: TablaMaestraDetalleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TablaMaestraDetalles to fetch.
     */
    orderBy?: TablaMaestraDetalleOrderByWithRelationInput | TablaMaestraDetalleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TablaMaestraDetalles.
     */
    cursor?: TablaMaestraDetalleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TablaMaestraDetalles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TablaMaestraDetalles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TablaMaestraDetalles.
     */
    distinct?: TablaMaestraDetalleScalarFieldEnum | TablaMaestraDetalleScalarFieldEnum[]
  }

  /**
   * TablaMaestraDetalle findMany
   */
  export type TablaMaestraDetalleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TablaMaestraDetalle
     */
    select?: TablaMaestraDetalleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TablaMaestraDetalle
     */
    omit?: TablaMaestraDetalleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TablaMaestraDetalleInclude<ExtArgs> | null
    /**
     * Filter, which TablaMaestraDetalles to fetch.
     */
    where?: TablaMaestraDetalleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TablaMaestraDetalles to fetch.
     */
    orderBy?: TablaMaestraDetalleOrderByWithRelationInput | TablaMaestraDetalleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TablaMaestraDetalles.
     */
    cursor?: TablaMaestraDetalleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TablaMaestraDetalles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TablaMaestraDetalles.
     */
    skip?: number
    distinct?: TablaMaestraDetalleScalarFieldEnum | TablaMaestraDetalleScalarFieldEnum[]
  }

  /**
   * TablaMaestraDetalle create
   */
  export type TablaMaestraDetalleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TablaMaestraDetalle
     */
    select?: TablaMaestraDetalleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TablaMaestraDetalle
     */
    omit?: TablaMaestraDetalleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TablaMaestraDetalleInclude<ExtArgs> | null
    /**
     * The data needed to create a TablaMaestraDetalle.
     */
    data: XOR<TablaMaestraDetalleCreateInput, TablaMaestraDetalleUncheckedCreateInput>
  }

  /**
   * TablaMaestraDetalle createMany
   */
  export type TablaMaestraDetalleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TablaMaestraDetalles.
     */
    data: TablaMaestraDetalleCreateManyInput | TablaMaestraDetalleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TablaMaestraDetalle createManyAndReturn
   */
  export type TablaMaestraDetalleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TablaMaestraDetalle
     */
    select?: TablaMaestraDetalleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TablaMaestraDetalle
     */
    omit?: TablaMaestraDetalleOmit<ExtArgs> | null
    /**
     * The data used to create many TablaMaestraDetalles.
     */
    data: TablaMaestraDetalleCreateManyInput | TablaMaestraDetalleCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TablaMaestraDetalleIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TablaMaestraDetalle update
   */
  export type TablaMaestraDetalleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TablaMaestraDetalle
     */
    select?: TablaMaestraDetalleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TablaMaestraDetalle
     */
    omit?: TablaMaestraDetalleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TablaMaestraDetalleInclude<ExtArgs> | null
    /**
     * The data needed to update a TablaMaestraDetalle.
     */
    data: XOR<TablaMaestraDetalleUpdateInput, TablaMaestraDetalleUncheckedUpdateInput>
    /**
     * Choose, which TablaMaestraDetalle to update.
     */
    where: TablaMaestraDetalleWhereUniqueInput
  }

  /**
   * TablaMaestraDetalle updateMany
   */
  export type TablaMaestraDetalleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TablaMaestraDetalles.
     */
    data: XOR<TablaMaestraDetalleUpdateManyMutationInput, TablaMaestraDetalleUncheckedUpdateManyInput>
    /**
     * Filter which TablaMaestraDetalles to update
     */
    where?: TablaMaestraDetalleWhereInput
    /**
     * Limit how many TablaMaestraDetalles to update.
     */
    limit?: number
  }

  /**
   * TablaMaestraDetalle updateManyAndReturn
   */
  export type TablaMaestraDetalleUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TablaMaestraDetalle
     */
    select?: TablaMaestraDetalleSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TablaMaestraDetalle
     */
    omit?: TablaMaestraDetalleOmit<ExtArgs> | null
    /**
     * The data used to update TablaMaestraDetalles.
     */
    data: XOR<TablaMaestraDetalleUpdateManyMutationInput, TablaMaestraDetalleUncheckedUpdateManyInput>
    /**
     * Filter which TablaMaestraDetalles to update
     */
    where?: TablaMaestraDetalleWhereInput
    /**
     * Limit how many TablaMaestraDetalles to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TablaMaestraDetalleIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * TablaMaestraDetalle upsert
   */
  export type TablaMaestraDetalleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TablaMaestraDetalle
     */
    select?: TablaMaestraDetalleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TablaMaestraDetalle
     */
    omit?: TablaMaestraDetalleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TablaMaestraDetalleInclude<ExtArgs> | null
    /**
     * The filter to search for the TablaMaestraDetalle to update in case it exists.
     */
    where: TablaMaestraDetalleWhereUniqueInput
    /**
     * In case the TablaMaestraDetalle found by the `where` argument doesn't exist, create a new TablaMaestraDetalle with this data.
     */
    create: XOR<TablaMaestraDetalleCreateInput, TablaMaestraDetalleUncheckedCreateInput>
    /**
     * In case the TablaMaestraDetalle was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TablaMaestraDetalleUpdateInput, TablaMaestraDetalleUncheckedUpdateInput>
  }

  /**
   * TablaMaestraDetalle delete
   */
  export type TablaMaestraDetalleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TablaMaestraDetalle
     */
    select?: TablaMaestraDetalleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TablaMaestraDetalle
     */
    omit?: TablaMaestraDetalleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TablaMaestraDetalleInclude<ExtArgs> | null
    /**
     * Filter which TablaMaestraDetalle to delete.
     */
    where: TablaMaestraDetalleWhereUniqueInput
  }

  /**
   * TablaMaestraDetalle deleteMany
   */
  export type TablaMaestraDetalleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TablaMaestraDetalles to delete
     */
    where?: TablaMaestraDetalleWhereInput
    /**
     * Limit how many TablaMaestraDetalles to delete.
     */
    limit?: number
  }

  /**
   * TablaMaestraDetalle without action
   */
  export type TablaMaestraDetalleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TablaMaestraDetalle
     */
    select?: TablaMaestraDetalleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TablaMaestraDetalle
     */
    omit?: TablaMaestraDetalleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TablaMaestraDetalleInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const EmpleadoScalarFieldEnum: {
    idEmpleado: 'idEmpleado',
    nombres: 'nombres',
    apellidoPaterno: 'apellidoPaterno',
    apellidoMaterno: 'apellidoMaterno',
    idEmpresaEmpleadora: 'idEmpresaEmpleadora',
    idEquipoEmpleadora: 'idEquipoEmpleadora',
    idPuestoEmpleadora: 'idPuestoEmpleadora',
    idUnidadEmpleadora: 'idUnidadEmpleadora',
    idUsuario: 'idUsuario',
    estado: 'estado',
    creadoPorId: 'creadoPorId',
    actualizadoPorId: 'actualizadoPorId',
    fechaCreacion: 'fechaCreacion',
    fechaModificacion: 'fechaModificacion'
  };

  export type EmpleadoScalarFieldEnum = (typeof EmpleadoScalarFieldEnum)[keyof typeof EmpleadoScalarFieldEnum]


  export const UsuarioScalarFieldEnum: {
    idUsuario: 'idUsuario',
    codigoUsuario: 'codigoUsuario',
    correoElectronico: 'correoElectronico',
    contrasena: 'contrasena',
    rol: 'rol',
    estado: 'estado',
    creadoPorId: 'creadoPorId',
    actualizadoPorId: 'actualizadoPorId',
    fechaCreacion: 'fechaCreacion',
    fechaModificacion: 'fechaModificacion'
  };

  export type UsuarioScalarFieldEnum = (typeof UsuarioScalarFieldEnum)[keyof typeof UsuarioScalarFieldEnum]


  export const EmpresaEmpleadoraScalarFieldEnum: {
    idEmpresaEmpleadora: 'idEmpresaEmpleadora',
    nombreEmpresa: 'nombreEmpresa',
    ruc: 'ruc',
    direccionEmpresa: 'direccionEmpresa',
    urlLogo: 'urlLogo',
    fechaVigenciaInicio: 'fechaVigenciaInicio',
    fechaVigenciaFin: 'fechaVigenciaFin',
    estado: 'estado',
    creadoPorId: 'creadoPorId',
    actualizadoPorId: 'actualizadoPorId',
    fechaCreacion: 'fechaCreacion',
    fechaModificacion: 'fechaModificacion'
  };

  export type EmpresaEmpleadoraScalarFieldEnum = (typeof EmpresaEmpleadoraScalarFieldEnum)[keyof typeof EmpresaEmpleadoraScalarFieldEnum]


  export const EquipoEmpleadoraScalarFieldEnum: {
    idEquipoEmpleadora: 'idEquipoEmpleadora',
    descripcion: 'descripcion',
    idEmpresaEmpleadora: 'idEmpresaEmpleadora',
    estado: 'estado',
    creadoPorId: 'creadoPorId',
    actualizadoPorId: 'actualizadoPorId',
    fechaCreacion: 'fechaCreacion',
    fechaModificacion: 'fechaModificacion'
  };

  export type EquipoEmpleadoraScalarFieldEnum = (typeof EquipoEmpleadoraScalarFieldEnum)[keyof typeof EquipoEmpleadoraScalarFieldEnum]


  export const PuestoEmpleadoraScalarFieldEnum: {
    idPuestoEmpleadora: 'idPuestoEmpleadora',
    descripcion: 'descripcion',
    idEmpresaEmpleadora: 'idEmpresaEmpleadora',
    estado: 'estado',
    creadoPorId: 'creadoPorId',
    actualizadoPorId: 'actualizadoPorId',
    fechaCreacion: 'fechaCreacion',
    fechaModificacion: 'fechaModificacion'
  };

  export type PuestoEmpleadoraScalarFieldEnum = (typeof PuestoEmpleadoraScalarFieldEnum)[keyof typeof PuestoEmpleadoraScalarFieldEnum]


  export const UnidadEmpleadoraScalarFieldEnum: {
    idUnidadEmpleadora: 'idUnidadEmpleadora',
    descripcion: 'descripcion',
    idEmpresaEmpleadora: 'idEmpresaEmpleadora',
    estado: 'estado',
    creadoPorId: 'creadoPorId',
    actualizadoPorId: 'actualizadoPorId',
    fechaCreacion: 'fechaCreacion',
    fechaModificacion: 'fechaModificacion'
  };

  export type UnidadEmpleadoraScalarFieldEnum = (typeof UnidadEmpleadoraScalarFieldEnum)[keyof typeof UnidadEmpleadoraScalarFieldEnum]


  export const ObjetivoScalarFieldEnum: {
    idObjetivo: 'idObjetivo',
    fechaVigenciaInicia: 'fechaVigenciaInicia',
    fechaVigenciaFin: 'fechaVigenciaFin',
    idEmpresaEmpleadora: 'idEmpresaEmpleadora',
    idEmpleado: 'idEmpleado',
    estado: 'estado',
    creadoPorId: 'creadoPorId',
    actualizadoPorId: 'actualizadoPorId',
    fechaCreacion: 'fechaCreacion',
    fechaModificacion: 'fechaModificacion'
  };

  export type ObjetivoScalarFieldEnum = (typeof ObjetivoScalarFieldEnum)[keyof typeof ObjetivoScalarFieldEnum]


  export const ObjetivoDetalleScalarFieldEnum: {
    idObjetivoDetalle: 'idObjetivoDetalle',
    idObjetivo: 'idObjetivo',
    secuencial: 'secuencial',
    descripcion: 'descripcion',
    descripcionIniciativa: 'descripcionIniciativa',
    unidadMedida: 'unidadMedida',
    pesoEspecifico: 'pesoEspecifico',
    estado: 'estado',
    creadoPorId: 'creadoPorId',
    actualizadoPorId: 'actualizadoPorId',
    fechaCreacion: 'fechaCreacion',
    fechaModificacion: 'fechaModificacion'
  };

  export type ObjetivoDetalleScalarFieldEnum = (typeof ObjetivoDetalleScalarFieldEnum)[keyof typeof ObjetivoDetalleScalarFieldEnum]


  export const TablaMaestraScalarFieldEnum: {
    idTablaMaestra: 'idTablaMaestra',
    descripcion: 'descripcion',
    estado: 'estado',
    creadoPorId: 'creadoPorId',
    actualizadoPorId: 'actualizadoPorId',
    fechaCreacion: 'fechaCreacion',
    fechaModificacion: 'fechaModificacion'
  };

  export type TablaMaestraScalarFieldEnum = (typeof TablaMaestraScalarFieldEnum)[keyof typeof TablaMaestraScalarFieldEnum]


  export const TablaMaestraDetalleScalarFieldEnum: {
    idTablaMaestraDetalle: 'idTablaMaestraDetalle',
    descripcion: 'descripcion',
    valor: 'valor',
    idTablaMaestra: 'idTablaMaestra',
    estado: 'estado',
    creadoPorId: 'creadoPorId',
    actualizadoPorId: 'actualizadoPorId',
    fechaCreacion: 'fechaCreacion',
    fechaModificacion: 'fechaModificacion'
  };

  export type TablaMaestraDetalleScalarFieldEnum = (typeof TablaMaestraDetalleScalarFieldEnum)[keyof typeof TablaMaestraDetalleScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Rol'
   */
  export type EnumRolFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Rol'>
    


  /**
   * Reference to a field of type 'Rol[]'
   */
  export type ListEnumRolFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Rol[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type EmpleadoWhereInput = {
    AND?: EmpleadoWhereInput | EmpleadoWhereInput[]
    OR?: EmpleadoWhereInput[]
    NOT?: EmpleadoWhereInput | EmpleadoWhereInput[]
    idEmpleado?: IntFilter<"Empleado"> | number
    nombres?: StringFilter<"Empleado"> | string
    apellidoPaterno?: StringFilter<"Empleado"> | string
    apellidoMaterno?: StringFilter<"Empleado"> | string
    idEmpresaEmpleadora?: IntFilter<"Empleado"> | number
    idEquipoEmpleadora?: IntFilter<"Empleado"> | number
    idPuestoEmpleadora?: IntFilter<"Empleado"> | number
    idUnidadEmpleadora?: IntFilter<"Empleado"> | number
    idUsuario?: IntFilter<"Empleado"> | number
    estado?: BoolFilter<"Empleado"> | boolean
    creadoPorId?: IntFilter<"Empleado"> | number
    actualizadoPorId?: IntNullableFilter<"Empleado"> | number | null
    fechaCreacion?: DateTimeFilter<"Empleado"> | Date | string
    fechaModificacion?: DateTimeNullableFilter<"Empleado"> | Date | string | null
    empresaEmpleadora?: XOR<EmpresaEmpleadoraScalarRelationFilter, EmpresaEmpleadoraWhereInput>
    equipoEmpleadora?: XOR<EquipoEmpleadoraScalarRelationFilter, EquipoEmpleadoraWhereInput>
    puestoEmpleadora?: XOR<PuestoEmpleadoraScalarRelationFilter, PuestoEmpleadoraWhereInput>
    unidadEmpleadora?: XOR<UnidadEmpleadoraScalarRelationFilter, UnidadEmpleadoraWhereInput>
    usuario?: XOR<UsuarioScalarRelationFilter, UsuarioWhereInput>
    objetivo?: ObjetivoListRelationFilter
  }

  export type EmpleadoOrderByWithRelationInput = {
    idEmpleado?: SortOrder
    nombres?: SortOrder
    apellidoPaterno?: SortOrder
    apellidoMaterno?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    idEquipoEmpleadora?: SortOrder
    idPuestoEmpleadora?: SortOrder
    idUnidadEmpleadora?: SortOrder
    idUsuario?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrderInput | SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrderInput | SortOrder
    empresaEmpleadora?: EmpresaEmpleadoraOrderByWithRelationInput
    equipoEmpleadora?: EquipoEmpleadoraOrderByWithRelationInput
    puestoEmpleadora?: PuestoEmpleadoraOrderByWithRelationInput
    unidadEmpleadora?: UnidadEmpleadoraOrderByWithRelationInput
    usuario?: UsuarioOrderByWithRelationInput
    objetivo?: ObjetivoOrderByRelationAggregateInput
  }

  export type EmpleadoWhereUniqueInput = Prisma.AtLeast<{
    idEmpleado?: number
    AND?: EmpleadoWhereInput | EmpleadoWhereInput[]
    OR?: EmpleadoWhereInput[]
    NOT?: EmpleadoWhereInput | EmpleadoWhereInput[]
    nombres?: StringFilter<"Empleado"> | string
    apellidoPaterno?: StringFilter<"Empleado"> | string
    apellidoMaterno?: StringFilter<"Empleado"> | string
    idEmpresaEmpleadora?: IntFilter<"Empleado"> | number
    idEquipoEmpleadora?: IntFilter<"Empleado"> | number
    idPuestoEmpleadora?: IntFilter<"Empleado"> | number
    idUnidadEmpleadora?: IntFilter<"Empleado"> | number
    idUsuario?: IntFilter<"Empleado"> | number
    estado?: BoolFilter<"Empleado"> | boolean
    creadoPorId?: IntFilter<"Empleado"> | number
    actualizadoPorId?: IntNullableFilter<"Empleado"> | number | null
    fechaCreacion?: DateTimeFilter<"Empleado"> | Date | string
    fechaModificacion?: DateTimeNullableFilter<"Empleado"> | Date | string | null
    empresaEmpleadora?: XOR<EmpresaEmpleadoraScalarRelationFilter, EmpresaEmpleadoraWhereInput>
    equipoEmpleadora?: XOR<EquipoEmpleadoraScalarRelationFilter, EquipoEmpleadoraWhereInput>
    puestoEmpleadora?: XOR<PuestoEmpleadoraScalarRelationFilter, PuestoEmpleadoraWhereInput>
    unidadEmpleadora?: XOR<UnidadEmpleadoraScalarRelationFilter, UnidadEmpleadoraWhereInput>
    usuario?: XOR<UsuarioScalarRelationFilter, UsuarioWhereInput>
    objetivo?: ObjetivoListRelationFilter
  }, "idEmpleado">

  export type EmpleadoOrderByWithAggregationInput = {
    idEmpleado?: SortOrder
    nombres?: SortOrder
    apellidoPaterno?: SortOrder
    apellidoMaterno?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    idEquipoEmpleadora?: SortOrder
    idPuestoEmpleadora?: SortOrder
    idUnidadEmpleadora?: SortOrder
    idUsuario?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrderInput | SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrderInput | SortOrder
    _count?: EmpleadoCountOrderByAggregateInput
    _avg?: EmpleadoAvgOrderByAggregateInput
    _max?: EmpleadoMaxOrderByAggregateInput
    _min?: EmpleadoMinOrderByAggregateInput
    _sum?: EmpleadoSumOrderByAggregateInput
  }

  export type EmpleadoScalarWhereWithAggregatesInput = {
    AND?: EmpleadoScalarWhereWithAggregatesInput | EmpleadoScalarWhereWithAggregatesInput[]
    OR?: EmpleadoScalarWhereWithAggregatesInput[]
    NOT?: EmpleadoScalarWhereWithAggregatesInput | EmpleadoScalarWhereWithAggregatesInput[]
    idEmpleado?: IntWithAggregatesFilter<"Empleado"> | number
    nombres?: StringWithAggregatesFilter<"Empleado"> | string
    apellidoPaterno?: StringWithAggregatesFilter<"Empleado"> | string
    apellidoMaterno?: StringWithAggregatesFilter<"Empleado"> | string
    idEmpresaEmpleadora?: IntWithAggregatesFilter<"Empleado"> | number
    idEquipoEmpleadora?: IntWithAggregatesFilter<"Empleado"> | number
    idPuestoEmpleadora?: IntWithAggregatesFilter<"Empleado"> | number
    idUnidadEmpleadora?: IntWithAggregatesFilter<"Empleado"> | number
    idUsuario?: IntWithAggregatesFilter<"Empleado"> | number
    estado?: BoolWithAggregatesFilter<"Empleado"> | boolean
    creadoPorId?: IntWithAggregatesFilter<"Empleado"> | number
    actualizadoPorId?: IntNullableWithAggregatesFilter<"Empleado"> | number | null
    fechaCreacion?: DateTimeWithAggregatesFilter<"Empleado"> | Date | string
    fechaModificacion?: DateTimeNullableWithAggregatesFilter<"Empleado"> | Date | string | null
  }

  export type UsuarioWhereInput = {
    AND?: UsuarioWhereInput | UsuarioWhereInput[]
    OR?: UsuarioWhereInput[]
    NOT?: UsuarioWhereInput | UsuarioWhereInput[]
    idUsuario?: IntFilter<"Usuario"> | number
    codigoUsuario?: StringFilter<"Usuario"> | string
    correoElectronico?: StringNullableFilter<"Usuario"> | string | null
    contrasena?: StringFilter<"Usuario"> | string
    rol?: EnumRolFilter<"Usuario"> | $Enums.Rol
    estado?: BoolFilter<"Usuario"> | boolean
    creadoPorId?: IntFilter<"Usuario"> | number
    actualizadoPorId?: IntNullableFilter<"Usuario"> | number | null
    fechaCreacion?: DateTimeFilter<"Usuario"> | Date | string
    fechaModificacion?: DateTimeNullableFilter<"Usuario"> | Date | string | null
    empleado?: EmpleadoListRelationFilter
  }

  export type UsuarioOrderByWithRelationInput = {
    idUsuario?: SortOrder
    codigoUsuario?: SortOrder
    correoElectronico?: SortOrderInput | SortOrder
    contrasena?: SortOrder
    rol?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrderInput | SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrderInput | SortOrder
    empleado?: EmpleadoOrderByRelationAggregateInput
  }

  export type UsuarioWhereUniqueInput = Prisma.AtLeast<{
    idUsuario?: number
    AND?: UsuarioWhereInput | UsuarioWhereInput[]
    OR?: UsuarioWhereInput[]
    NOT?: UsuarioWhereInput | UsuarioWhereInput[]
    codigoUsuario?: StringFilter<"Usuario"> | string
    correoElectronico?: StringNullableFilter<"Usuario"> | string | null
    contrasena?: StringFilter<"Usuario"> | string
    rol?: EnumRolFilter<"Usuario"> | $Enums.Rol
    estado?: BoolFilter<"Usuario"> | boolean
    creadoPorId?: IntFilter<"Usuario"> | number
    actualizadoPorId?: IntNullableFilter<"Usuario"> | number | null
    fechaCreacion?: DateTimeFilter<"Usuario"> | Date | string
    fechaModificacion?: DateTimeNullableFilter<"Usuario"> | Date | string | null
    empleado?: EmpleadoListRelationFilter
  }, "idUsuario">

  export type UsuarioOrderByWithAggregationInput = {
    idUsuario?: SortOrder
    codigoUsuario?: SortOrder
    correoElectronico?: SortOrderInput | SortOrder
    contrasena?: SortOrder
    rol?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrderInput | SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrderInput | SortOrder
    _count?: UsuarioCountOrderByAggregateInput
    _avg?: UsuarioAvgOrderByAggregateInput
    _max?: UsuarioMaxOrderByAggregateInput
    _min?: UsuarioMinOrderByAggregateInput
    _sum?: UsuarioSumOrderByAggregateInput
  }

  export type UsuarioScalarWhereWithAggregatesInput = {
    AND?: UsuarioScalarWhereWithAggregatesInput | UsuarioScalarWhereWithAggregatesInput[]
    OR?: UsuarioScalarWhereWithAggregatesInput[]
    NOT?: UsuarioScalarWhereWithAggregatesInput | UsuarioScalarWhereWithAggregatesInput[]
    idUsuario?: IntWithAggregatesFilter<"Usuario"> | number
    codigoUsuario?: StringWithAggregatesFilter<"Usuario"> | string
    correoElectronico?: StringNullableWithAggregatesFilter<"Usuario"> | string | null
    contrasena?: StringWithAggregatesFilter<"Usuario"> | string
    rol?: EnumRolWithAggregatesFilter<"Usuario"> | $Enums.Rol
    estado?: BoolWithAggregatesFilter<"Usuario"> | boolean
    creadoPorId?: IntWithAggregatesFilter<"Usuario"> | number
    actualizadoPorId?: IntNullableWithAggregatesFilter<"Usuario"> | number | null
    fechaCreacion?: DateTimeWithAggregatesFilter<"Usuario"> | Date | string
    fechaModificacion?: DateTimeNullableWithAggregatesFilter<"Usuario"> | Date | string | null
  }

  export type EmpresaEmpleadoraWhereInput = {
    AND?: EmpresaEmpleadoraWhereInput | EmpresaEmpleadoraWhereInput[]
    OR?: EmpresaEmpleadoraWhereInput[]
    NOT?: EmpresaEmpleadoraWhereInput | EmpresaEmpleadoraWhereInput[]
    idEmpresaEmpleadora?: IntFilter<"EmpresaEmpleadora"> | number
    nombreEmpresa?: StringFilter<"EmpresaEmpleadora"> | string
    ruc?: StringNullableFilter<"EmpresaEmpleadora"> | string | null
    direccionEmpresa?: StringNullableFilter<"EmpresaEmpleadora"> | string | null
    urlLogo?: StringFilter<"EmpresaEmpleadora"> | string
    fechaVigenciaInicio?: DateTimeFilter<"EmpresaEmpleadora"> | Date | string
    fechaVigenciaFin?: DateTimeFilter<"EmpresaEmpleadora"> | Date | string
    estado?: BoolFilter<"EmpresaEmpleadora"> | boolean
    creadoPorId?: IntFilter<"EmpresaEmpleadora"> | number
    actualizadoPorId?: IntNullableFilter<"EmpresaEmpleadora"> | number | null
    fechaCreacion?: DateTimeFilter<"EmpresaEmpleadora"> | Date | string
    fechaModificacion?: DateTimeNullableFilter<"EmpresaEmpleadora"> | Date | string | null
    equipoEmpleadora?: EquipoEmpleadoraListRelationFilter
    puestoEmpleadora?: PuestoEmpleadoraListRelationFilter
    unidadEmpleadora?: UnidadEmpleadoraListRelationFilter
    objetivo?: ObjetivoListRelationFilter
    empleado?: EmpleadoListRelationFilter
  }

  export type EmpresaEmpleadoraOrderByWithRelationInput = {
    idEmpresaEmpleadora?: SortOrder
    nombreEmpresa?: SortOrder
    ruc?: SortOrderInput | SortOrder
    direccionEmpresa?: SortOrderInput | SortOrder
    urlLogo?: SortOrder
    fechaVigenciaInicio?: SortOrder
    fechaVigenciaFin?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrderInput | SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrderInput | SortOrder
    equipoEmpleadora?: EquipoEmpleadoraOrderByRelationAggregateInput
    puestoEmpleadora?: PuestoEmpleadoraOrderByRelationAggregateInput
    unidadEmpleadora?: UnidadEmpleadoraOrderByRelationAggregateInput
    objetivo?: ObjetivoOrderByRelationAggregateInput
    empleado?: EmpleadoOrderByRelationAggregateInput
  }

  export type EmpresaEmpleadoraWhereUniqueInput = Prisma.AtLeast<{
    idEmpresaEmpleadora?: number
    AND?: EmpresaEmpleadoraWhereInput | EmpresaEmpleadoraWhereInput[]
    OR?: EmpresaEmpleadoraWhereInput[]
    NOT?: EmpresaEmpleadoraWhereInput | EmpresaEmpleadoraWhereInput[]
    nombreEmpresa?: StringFilter<"EmpresaEmpleadora"> | string
    ruc?: StringNullableFilter<"EmpresaEmpleadora"> | string | null
    direccionEmpresa?: StringNullableFilter<"EmpresaEmpleadora"> | string | null
    urlLogo?: StringFilter<"EmpresaEmpleadora"> | string
    fechaVigenciaInicio?: DateTimeFilter<"EmpresaEmpleadora"> | Date | string
    fechaVigenciaFin?: DateTimeFilter<"EmpresaEmpleadora"> | Date | string
    estado?: BoolFilter<"EmpresaEmpleadora"> | boolean
    creadoPorId?: IntFilter<"EmpresaEmpleadora"> | number
    actualizadoPorId?: IntNullableFilter<"EmpresaEmpleadora"> | number | null
    fechaCreacion?: DateTimeFilter<"EmpresaEmpleadora"> | Date | string
    fechaModificacion?: DateTimeNullableFilter<"EmpresaEmpleadora"> | Date | string | null
    equipoEmpleadora?: EquipoEmpleadoraListRelationFilter
    puestoEmpleadora?: PuestoEmpleadoraListRelationFilter
    unidadEmpleadora?: UnidadEmpleadoraListRelationFilter
    objetivo?: ObjetivoListRelationFilter
    empleado?: EmpleadoListRelationFilter
  }, "idEmpresaEmpleadora">

  export type EmpresaEmpleadoraOrderByWithAggregationInput = {
    idEmpresaEmpleadora?: SortOrder
    nombreEmpresa?: SortOrder
    ruc?: SortOrderInput | SortOrder
    direccionEmpresa?: SortOrderInput | SortOrder
    urlLogo?: SortOrder
    fechaVigenciaInicio?: SortOrder
    fechaVigenciaFin?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrderInput | SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrderInput | SortOrder
    _count?: EmpresaEmpleadoraCountOrderByAggregateInput
    _avg?: EmpresaEmpleadoraAvgOrderByAggregateInput
    _max?: EmpresaEmpleadoraMaxOrderByAggregateInput
    _min?: EmpresaEmpleadoraMinOrderByAggregateInput
    _sum?: EmpresaEmpleadoraSumOrderByAggregateInput
  }

  export type EmpresaEmpleadoraScalarWhereWithAggregatesInput = {
    AND?: EmpresaEmpleadoraScalarWhereWithAggregatesInput | EmpresaEmpleadoraScalarWhereWithAggregatesInput[]
    OR?: EmpresaEmpleadoraScalarWhereWithAggregatesInput[]
    NOT?: EmpresaEmpleadoraScalarWhereWithAggregatesInput | EmpresaEmpleadoraScalarWhereWithAggregatesInput[]
    idEmpresaEmpleadora?: IntWithAggregatesFilter<"EmpresaEmpleadora"> | number
    nombreEmpresa?: StringWithAggregatesFilter<"EmpresaEmpleadora"> | string
    ruc?: StringNullableWithAggregatesFilter<"EmpresaEmpleadora"> | string | null
    direccionEmpresa?: StringNullableWithAggregatesFilter<"EmpresaEmpleadora"> | string | null
    urlLogo?: StringWithAggregatesFilter<"EmpresaEmpleadora"> | string
    fechaVigenciaInicio?: DateTimeWithAggregatesFilter<"EmpresaEmpleadora"> | Date | string
    fechaVigenciaFin?: DateTimeWithAggregatesFilter<"EmpresaEmpleadora"> | Date | string
    estado?: BoolWithAggregatesFilter<"EmpresaEmpleadora"> | boolean
    creadoPorId?: IntWithAggregatesFilter<"EmpresaEmpleadora"> | number
    actualizadoPorId?: IntNullableWithAggregatesFilter<"EmpresaEmpleadora"> | number | null
    fechaCreacion?: DateTimeWithAggregatesFilter<"EmpresaEmpleadora"> | Date | string
    fechaModificacion?: DateTimeNullableWithAggregatesFilter<"EmpresaEmpleadora"> | Date | string | null
  }

  export type EquipoEmpleadoraWhereInput = {
    AND?: EquipoEmpleadoraWhereInput | EquipoEmpleadoraWhereInput[]
    OR?: EquipoEmpleadoraWhereInput[]
    NOT?: EquipoEmpleadoraWhereInput | EquipoEmpleadoraWhereInput[]
    idEquipoEmpleadora?: IntFilter<"EquipoEmpleadora"> | number
    descripcion?: StringFilter<"EquipoEmpleadora"> | string
    idEmpresaEmpleadora?: IntFilter<"EquipoEmpleadora"> | number
    estado?: BoolFilter<"EquipoEmpleadora"> | boolean
    creadoPorId?: IntFilter<"EquipoEmpleadora"> | number
    actualizadoPorId?: IntNullableFilter<"EquipoEmpleadora"> | number | null
    fechaCreacion?: DateTimeFilter<"EquipoEmpleadora"> | Date | string
    fechaModificacion?: DateTimeNullableFilter<"EquipoEmpleadora"> | Date | string | null
    empresaEmpleadora?: XOR<EmpresaEmpleadoraScalarRelationFilter, EmpresaEmpleadoraWhereInput>
    Empleado?: EmpleadoListRelationFilter
  }

  export type EquipoEmpleadoraOrderByWithRelationInput = {
    idEquipoEmpleadora?: SortOrder
    descripcion?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrderInput | SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrderInput | SortOrder
    empresaEmpleadora?: EmpresaEmpleadoraOrderByWithRelationInput
    Empleado?: EmpleadoOrderByRelationAggregateInput
  }

  export type EquipoEmpleadoraWhereUniqueInput = Prisma.AtLeast<{
    idEquipoEmpleadora?: number
    AND?: EquipoEmpleadoraWhereInput | EquipoEmpleadoraWhereInput[]
    OR?: EquipoEmpleadoraWhereInput[]
    NOT?: EquipoEmpleadoraWhereInput | EquipoEmpleadoraWhereInput[]
    descripcion?: StringFilter<"EquipoEmpleadora"> | string
    idEmpresaEmpleadora?: IntFilter<"EquipoEmpleadora"> | number
    estado?: BoolFilter<"EquipoEmpleadora"> | boolean
    creadoPorId?: IntFilter<"EquipoEmpleadora"> | number
    actualizadoPorId?: IntNullableFilter<"EquipoEmpleadora"> | number | null
    fechaCreacion?: DateTimeFilter<"EquipoEmpleadora"> | Date | string
    fechaModificacion?: DateTimeNullableFilter<"EquipoEmpleadora"> | Date | string | null
    empresaEmpleadora?: XOR<EmpresaEmpleadoraScalarRelationFilter, EmpresaEmpleadoraWhereInput>
    Empleado?: EmpleadoListRelationFilter
  }, "idEquipoEmpleadora">

  export type EquipoEmpleadoraOrderByWithAggregationInput = {
    idEquipoEmpleadora?: SortOrder
    descripcion?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrderInput | SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrderInput | SortOrder
    _count?: EquipoEmpleadoraCountOrderByAggregateInput
    _avg?: EquipoEmpleadoraAvgOrderByAggregateInput
    _max?: EquipoEmpleadoraMaxOrderByAggregateInput
    _min?: EquipoEmpleadoraMinOrderByAggregateInput
    _sum?: EquipoEmpleadoraSumOrderByAggregateInput
  }

  export type EquipoEmpleadoraScalarWhereWithAggregatesInput = {
    AND?: EquipoEmpleadoraScalarWhereWithAggregatesInput | EquipoEmpleadoraScalarWhereWithAggregatesInput[]
    OR?: EquipoEmpleadoraScalarWhereWithAggregatesInput[]
    NOT?: EquipoEmpleadoraScalarWhereWithAggregatesInput | EquipoEmpleadoraScalarWhereWithAggregatesInput[]
    idEquipoEmpleadora?: IntWithAggregatesFilter<"EquipoEmpleadora"> | number
    descripcion?: StringWithAggregatesFilter<"EquipoEmpleadora"> | string
    idEmpresaEmpleadora?: IntWithAggregatesFilter<"EquipoEmpleadora"> | number
    estado?: BoolWithAggregatesFilter<"EquipoEmpleadora"> | boolean
    creadoPorId?: IntWithAggregatesFilter<"EquipoEmpleadora"> | number
    actualizadoPorId?: IntNullableWithAggregatesFilter<"EquipoEmpleadora"> | number | null
    fechaCreacion?: DateTimeWithAggregatesFilter<"EquipoEmpleadora"> | Date | string
    fechaModificacion?: DateTimeNullableWithAggregatesFilter<"EquipoEmpleadora"> | Date | string | null
  }

  export type PuestoEmpleadoraWhereInput = {
    AND?: PuestoEmpleadoraWhereInput | PuestoEmpleadoraWhereInput[]
    OR?: PuestoEmpleadoraWhereInput[]
    NOT?: PuestoEmpleadoraWhereInput | PuestoEmpleadoraWhereInput[]
    idPuestoEmpleadora?: IntFilter<"PuestoEmpleadora"> | number
    descripcion?: StringFilter<"PuestoEmpleadora"> | string
    idEmpresaEmpleadora?: IntFilter<"PuestoEmpleadora"> | number
    estado?: BoolFilter<"PuestoEmpleadora"> | boolean
    creadoPorId?: IntFilter<"PuestoEmpleadora"> | number
    actualizadoPorId?: IntNullableFilter<"PuestoEmpleadora"> | number | null
    fechaCreacion?: DateTimeFilter<"PuestoEmpleadora"> | Date | string
    fechaModificacion?: DateTimeNullableFilter<"PuestoEmpleadora"> | Date | string | null
    empresaEmpleadora?: XOR<EmpresaEmpleadoraScalarRelationFilter, EmpresaEmpleadoraWhereInput>
    Empleado?: EmpleadoListRelationFilter
  }

  export type PuestoEmpleadoraOrderByWithRelationInput = {
    idPuestoEmpleadora?: SortOrder
    descripcion?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrderInput | SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrderInput | SortOrder
    empresaEmpleadora?: EmpresaEmpleadoraOrderByWithRelationInput
    Empleado?: EmpleadoOrderByRelationAggregateInput
  }

  export type PuestoEmpleadoraWhereUniqueInput = Prisma.AtLeast<{
    idPuestoEmpleadora?: number
    AND?: PuestoEmpleadoraWhereInput | PuestoEmpleadoraWhereInput[]
    OR?: PuestoEmpleadoraWhereInput[]
    NOT?: PuestoEmpleadoraWhereInput | PuestoEmpleadoraWhereInput[]
    descripcion?: StringFilter<"PuestoEmpleadora"> | string
    idEmpresaEmpleadora?: IntFilter<"PuestoEmpleadora"> | number
    estado?: BoolFilter<"PuestoEmpleadora"> | boolean
    creadoPorId?: IntFilter<"PuestoEmpleadora"> | number
    actualizadoPorId?: IntNullableFilter<"PuestoEmpleadora"> | number | null
    fechaCreacion?: DateTimeFilter<"PuestoEmpleadora"> | Date | string
    fechaModificacion?: DateTimeNullableFilter<"PuestoEmpleadora"> | Date | string | null
    empresaEmpleadora?: XOR<EmpresaEmpleadoraScalarRelationFilter, EmpresaEmpleadoraWhereInput>
    Empleado?: EmpleadoListRelationFilter
  }, "idPuestoEmpleadora">

  export type PuestoEmpleadoraOrderByWithAggregationInput = {
    idPuestoEmpleadora?: SortOrder
    descripcion?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrderInput | SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrderInput | SortOrder
    _count?: PuestoEmpleadoraCountOrderByAggregateInput
    _avg?: PuestoEmpleadoraAvgOrderByAggregateInput
    _max?: PuestoEmpleadoraMaxOrderByAggregateInput
    _min?: PuestoEmpleadoraMinOrderByAggregateInput
    _sum?: PuestoEmpleadoraSumOrderByAggregateInput
  }

  export type PuestoEmpleadoraScalarWhereWithAggregatesInput = {
    AND?: PuestoEmpleadoraScalarWhereWithAggregatesInput | PuestoEmpleadoraScalarWhereWithAggregatesInput[]
    OR?: PuestoEmpleadoraScalarWhereWithAggregatesInput[]
    NOT?: PuestoEmpleadoraScalarWhereWithAggregatesInput | PuestoEmpleadoraScalarWhereWithAggregatesInput[]
    idPuestoEmpleadora?: IntWithAggregatesFilter<"PuestoEmpleadora"> | number
    descripcion?: StringWithAggregatesFilter<"PuestoEmpleadora"> | string
    idEmpresaEmpleadora?: IntWithAggregatesFilter<"PuestoEmpleadora"> | number
    estado?: BoolWithAggregatesFilter<"PuestoEmpleadora"> | boolean
    creadoPorId?: IntWithAggregatesFilter<"PuestoEmpleadora"> | number
    actualizadoPorId?: IntNullableWithAggregatesFilter<"PuestoEmpleadora"> | number | null
    fechaCreacion?: DateTimeWithAggregatesFilter<"PuestoEmpleadora"> | Date | string
    fechaModificacion?: DateTimeNullableWithAggregatesFilter<"PuestoEmpleadora"> | Date | string | null
  }

  export type UnidadEmpleadoraWhereInput = {
    AND?: UnidadEmpleadoraWhereInput | UnidadEmpleadoraWhereInput[]
    OR?: UnidadEmpleadoraWhereInput[]
    NOT?: UnidadEmpleadoraWhereInput | UnidadEmpleadoraWhereInput[]
    idUnidadEmpleadora?: IntFilter<"UnidadEmpleadora"> | number
    descripcion?: StringFilter<"UnidadEmpleadora"> | string
    idEmpresaEmpleadora?: IntFilter<"UnidadEmpleadora"> | number
    estado?: BoolFilter<"UnidadEmpleadora"> | boolean
    creadoPorId?: IntFilter<"UnidadEmpleadora"> | number
    actualizadoPorId?: IntNullableFilter<"UnidadEmpleadora"> | number | null
    fechaCreacion?: DateTimeFilter<"UnidadEmpleadora"> | Date | string
    fechaModificacion?: DateTimeNullableFilter<"UnidadEmpleadora"> | Date | string | null
    empresaEmpleadora?: XOR<EmpresaEmpleadoraScalarRelationFilter, EmpresaEmpleadoraWhereInput>
    empleado?: EmpleadoListRelationFilter
  }

  export type UnidadEmpleadoraOrderByWithRelationInput = {
    idUnidadEmpleadora?: SortOrder
    descripcion?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrderInput | SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrderInput | SortOrder
    empresaEmpleadora?: EmpresaEmpleadoraOrderByWithRelationInput
    empleado?: EmpleadoOrderByRelationAggregateInput
  }

  export type UnidadEmpleadoraWhereUniqueInput = Prisma.AtLeast<{
    idUnidadEmpleadora?: number
    AND?: UnidadEmpleadoraWhereInput | UnidadEmpleadoraWhereInput[]
    OR?: UnidadEmpleadoraWhereInput[]
    NOT?: UnidadEmpleadoraWhereInput | UnidadEmpleadoraWhereInput[]
    descripcion?: StringFilter<"UnidadEmpleadora"> | string
    idEmpresaEmpleadora?: IntFilter<"UnidadEmpleadora"> | number
    estado?: BoolFilter<"UnidadEmpleadora"> | boolean
    creadoPorId?: IntFilter<"UnidadEmpleadora"> | number
    actualizadoPorId?: IntNullableFilter<"UnidadEmpleadora"> | number | null
    fechaCreacion?: DateTimeFilter<"UnidadEmpleadora"> | Date | string
    fechaModificacion?: DateTimeNullableFilter<"UnidadEmpleadora"> | Date | string | null
    empresaEmpleadora?: XOR<EmpresaEmpleadoraScalarRelationFilter, EmpresaEmpleadoraWhereInput>
    empleado?: EmpleadoListRelationFilter
  }, "idUnidadEmpleadora">

  export type UnidadEmpleadoraOrderByWithAggregationInput = {
    idUnidadEmpleadora?: SortOrder
    descripcion?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrderInput | SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrderInput | SortOrder
    _count?: UnidadEmpleadoraCountOrderByAggregateInput
    _avg?: UnidadEmpleadoraAvgOrderByAggregateInput
    _max?: UnidadEmpleadoraMaxOrderByAggregateInput
    _min?: UnidadEmpleadoraMinOrderByAggregateInput
    _sum?: UnidadEmpleadoraSumOrderByAggregateInput
  }

  export type UnidadEmpleadoraScalarWhereWithAggregatesInput = {
    AND?: UnidadEmpleadoraScalarWhereWithAggregatesInput | UnidadEmpleadoraScalarWhereWithAggregatesInput[]
    OR?: UnidadEmpleadoraScalarWhereWithAggregatesInput[]
    NOT?: UnidadEmpleadoraScalarWhereWithAggregatesInput | UnidadEmpleadoraScalarWhereWithAggregatesInput[]
    idUnidadEmpleadora?: IntWithAggregatesFilter<"UnidadEmpleadora"> | number
    descripcion?: StringWithAggregatesFilter<"UnidadEmpleadora"> | string
    idEmpresaEmpleadora?: IntWithAggregatesFilter<"UnidadEmpleadora"> | number
    estado?: BoolWithAggregatesFilter<"UnidadEmpleadora"> | boolean
    creadoPorId?: IntWithAggregatesFilter<"UnidadEmpleadora"> | number
    actualizadoPorId?: IntNullableWithAggregatesFilter<"UnidadEmpleadora"> | number | null
    fechaCreacion?: DateTimeWithAggregatesFilter<"UnidadEmpleadora"> | Date | string
    fechaModificacion?: DateTimeNullableWithAggregatesFilter<"UnidadEmpleadora"> | Date | string | null
  }

  export type ObjetivoWhereInput = {
    AND?: ObjetivoWhereInput | ObjetivoWhereInput[]
    OR?: ObjetivoWhereInput[]
    NOT?: ObjetivoWhereInput | ObjetivoWhereInput[]
    idObjetivo?: IntFilter<"Objetivo"> | number
    fechaVigenciaInicia?: DateTimeFilter<"Objetivo"> | Date | string
    fechaVigenciaFin?: DateTimeFilter<"Objetivo"> | Date | string
    idEmpresaEmpleadora?: IntFilter<"Objetivo"> | number
    idEmpleado?: IntFilter<"Objetivo"> | number
    estado?: BoolFilter<"Objetivo"> | boolean
    creadoPorId?: IntFilter<"Objetivo"> | number
    actualizadoPorId?: IntNullableFilter<"Objetivo"> | number | null
    fechaCreacion?: DateTimeFilter<"Objetivo"> | Date | string
    fechaModificacion?: DateTimeNullableFilter<"Objetivo"> | Date | string | null
    empresaEmpleadora?: XOR<EmpresaEmpleadoraScalarRelationFilter, EmpresaEmpleadoraWhereInput>
    empleado?: XOR<EmpleadoScalarRelationFilter, EmpleadoWhereInput>
    ObjetivoDetalle?: ObjetivoDetalleListRelationFilter
  }

  export type ObjetivoOrderByWithRelationInput = {
    idObjetivo?: SortOrder
    fechaVigenciaInicia?: SortOrder
    fechaVigenciaFin?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    idEmpleado?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrderInput | SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrderInput | SortOrder
    empresaEmpleadora?: EmpresaEmpleadoraOrderByWithRelationInput
    empleado?: EmpleadoOrderByWithRelationInput
    ObjetivoDetalle?: ObjetivoDetalleOrderByRelationAggregateInput
  }

  export type ObjetivoWhereUniqueInput = Prisma.AtLeast<{
    idObjetivo?: number
    AND?: ObjetivoWhereInput | ObjetivoWhereInput[]
    OR?: ObjetivoWhereInput[]
    NOT?: ObjetivoWhereInput | ObjetivoWhereInput[]
    fechaVigenciaInicia?: DateTimeFilter<"Objetivo"> | Date | string
    fechaVigenciaFin?: DateTimeFilter<"Objetivo"> | Date | string
    idEmpresaEmpleadora?: IntFilter<"Objetivo"> | number
    idEmpleado?: IntFilter<"Objetivo"> | number
    estado?: BoolFilter<"Objetivo"> | boolean
    creadoPorId?: IntFilter<"Objetivo"> | number
    actualizadoPorId?: IntNullableFilter<"Objetivo"> | number | null
    fechaCreacion?: DateTimeFilter<"Objetivo"> | Date | string
    fechaModificacion?: DateTimeNullableFilter<"Objetivo"> | Date | string | null
    empresaEmpleadora?: XOR<EmpresaEmpleadoraScalarRelationFilter, EmpresaEmpleadoraWhereInput>
    empleado?: XOR<EmpleadoScalarRelationFilter, EmpleadoWhereInput>
    ObjetivoDetalle?: ObjetivoDetalleListRelationFilter
  }, "idObjetivo">

  export type ObjetivoOrderByWithAggregationInput = {
    idObjetivo?: SortOrder
    fechaVigenciaInicia?: SortOrder
    fechaVigenciaFin?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    idEmpleado?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrderInput | SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrderInput | SortOrder
    _count?: ObjetivoCountOrderByAggregateInput
    _avg?: ObjetivoAvgOrderByAggregateInput
    _max?: ObjetivoMaxOrderByAggregateInput
    _min?: ObjetivoMinOrderByAggregateInput
    _sum?: ObjetivoSumOrderByAggregateInput
  }

  export type ObjetivoScalarWhereWithAggregatesInput = {
    AND?: ObjetivoScalarWhereWithAggregatesInput | ObjetivoScalarWhereWithAggregatesInput[]
    OR?: ObjetivoScalarWhereWithAggregatesInput[]
    NOT?: ObjetivoScalarWhereWithAggregatesInput | ObjetivoScalarWhereWithAggregatesInput[]
    idObjetivo?: IntWithAggregatesFilter<"Objetivo"> | number
    fechaVigenciaInicia?: DateTimeWithAggregatesFilter<"Objetivo"> | Date | string
    fechaVigenciaFin?: DateTimeWithAggregatesFilter<"Objetivo"> | Date | string
    idEmpresaEmpleadora?: IntWithAggregatesFilter<"Objetivo"> | number
    idEmpleado?: IntWithAggregatesFilter<"Objetivo"> | number
    estado?: BoolWithAggregatesFilter<"Objetivo"> | boolean
    creadoPorId?: IntWithAggregatesFilter<"Objetivo"> | number
    actualizadoPorId?: IntNullableWithAggregatesFilter<"Objetivo"> | number | null
    fechaCreacion?: DateTimeWithAggregatesFilter<"Objetivo"> | Date | string
    fechaModificacion?: DateTimeNullableWithAggregatesFilter<"Objetivo"> | Date | string | null
  }

  export type ObjetivoDetalleWhereInput = {
    AND?: ObjetivoDetalleWhereInput | ObjetivoDetalleWhereInput[]
    OR?: ObjetivoDetalleWhereInput[]
    NOT?: ObjetivoDetalleWhereInput | ObjetivoDetalleWhereInput[]
    idObjetivoDetalle?: IntFilter<"ObjetivoDetalle"> | number
    idObjetivo?: IntFilter<"ObjetivoDetalle"> | number
    secuencial?: IntFilter<"ObjetivoDetalle"> | number
    descripcion?: StringNullableFilter<"ObjetivoDetalle"> | string | null
    descripcionIniciativa?: StringNullableFilter<"ObjetivoDetalle"> | string | null
    unidadMedida?: StringNullableFilter<"ObjetivoDetalle"> | string | null
    pesoEspecifico?: FloatNullableFilter<"ObjetivoDetalle"> | number | null
    estado?: BoolFilter<"ObjetivoDetalle"> | boolean
    creadoPorId?: IntFilter<"ObjetivoDetalle"> | number
    actualizadoPorId?: IntNullableFilter<"ObjetivoDetalle"> | number | null
    fechaCreacion?: DateTimeFilter<"ObjetivoDetalle"> | Date | string
    fechaModificacion?: DateTimeNullableFilter<"ObjetivoDetalle"> | Date | string | null
    objetivo?: XOR<ObjetivoScalarRelationFilter, ObjetivoWhereInput>
  }

  export type ObjetivoDetalleOrderByWithRelationInput = {
    idObjetivoDetalle?: SortOrder
    idObjetivo?: SortOrder
    secuencial?: SortOrder
    descripcion?: SortOrderInput | SortOrder
    descripcionIniciativa?: SortOrderInput | SortOrder
    unidadMedida?: SortOrderInput | SortOrder
    pesoEspecifico?: SortOrderInput | SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrderInput | SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrderInput | SortOrder
    objetivo?: ObjetivoOrderByWithRelationInput
  }

  export type ObjetivoDetalleWhereUniqueInput = Prisma.AtLeast<{
    idObjetivoDetalle?: number
    AND?: ObjetivoDetalleWhereInput | ObjetivoDetalleWhereInput[]
    OR?: ObjetivoDetalleWhereInput[]
    NOT?: ObjetivoDetalleWhereInput | ObjetivoDetalleWhereInput[]
    idObjetivo?: IntFilter<"ObjetivoDetalle"> | number
    secuencial?: IntFilter<"ObjetivoDetalle"> | number
    descripcion?: StringNullableFilter<"ObjetivoDetalle"> | string | null
    descripcionIniciativa?: StringNullableFilter<"ObjetivoDetalle"> | string | null
    unidadMedida?: StringNullableFilter<"ObjetivoDetalle"> | string | null
    pesoEspecifico?: FloatNullableFilter<"ObjetivoDetalle"> | number | null
    estado?: BoolFilter<"ObjetivoDetalle"> | boolean
    creadoPorId?: IntFilter<"ObjetivoDetalle"> | number
    actualizadoPorId?: IntNullableFilter<"ObjetivoDetalle"> | number | null
    fechaCreacion?: DateTimeFilter<"ObjetivoDetalle"> | Date | string
    fechaModificacion?: DateTimeNullableFilter<"ObjetivoDetalle"> | Date | string | null
    objetivo?: XOR<ObjetivoScalarRelationFilter, ObjetivoWhereInput>
  }, "idObjetivoDetalle">

  export type ObjetivoDetalleOrderByWithAggregationInput = {
    idObjetivoDetalle?: SortOrder
    idObjetivo?: SortOrder
    secuencial?: SortOrder
    descripcion?: SortOrderInput | SortOrder
    descripcionIniciativa?: SortOrderInput | SortOrder
    unidadMedida?: SortOrderInput | SortOrder
    pesoEspecifico?: SortOrderInput | SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrderInput | SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrderInput | SortOrder
    _count?: ObjetivoDetalleCountOrderByAggregateInput
    _avg?: ObjetivoDetalleAvgOrderByAggregateInput
    _max?: ObjetivoDetalleMaxOrderByAggregateInput
    _min?: ObjetivoDetalleMinOrderByAggregateInput
    _sum?: ObjetivoDetalleSumOrderByAggregateInput
  }

  export type ObjetivoDetalleScalarWhereWithAggregatesInput = {
    AND?: ObjetivoDetalleScalarWhereWithAggregatesInput | ObjetivoDetalleScalarWhereWithAggregatesInput[]
    OR?: ObjetivoDetalleScalarWhereWithAggregatesInput[]
    NOT?: ObjetivoDetalleScalarWhereWithAggregatesInput | ObjetivoDetalleScalarWhereWithAggregatesInput[]
    idObjetivoDetalle?: IntWithAggregatesFilter<"ObjetivoDetalle"> | number
    idObjetivo?: IntWithAggregatesFilter<"ObjetivoDetalle"> | number
    secuencial?: IntWithAggregatesFilter<"ObjetivoDetalle"> | number
    descripcion?: StringNullableWithAggregatesFilter<"ObjetivoDetalle"> | string | null
    descripcionIniciativa?: StringNullableWithAggregatesFilter<"ObjetivoDetalle"> | string | null
    unidadMedida?: StringNullableWithAggregatesFilter<"ObjetivoDetalle"> | string | null
    pesoEspecifico?: FloatNullableWithAggregatesFilter<"ObjetivoDetalle"> | number | null
    estado?: BoolWithAggregatesFilter<"ObjetivoDetalle"> | boolean
    creadoPorId?: IntWithAggregatesFilter<"ObjetivoDetalle"> | number
    actualizadoPorId?: IntNullableWithAggregatesFilter<"ObjetivoDetalle"> | number | null
    fechaCreacion?: DateTimeWithAggregatesFilter<"ObjetivoDetalle"> | Date | string
    fechaModificacion?: DateTimeNullableWithAggregatesFilter<"ObjetivoDetalle"> | Date | string | null
  }

  export type TablaMaestraWhereInput = {
    AND?: TablaMaestraWhereInput | TablaMaestraWhereInput[]
    OR?: TablaMaestraWhereInput[]
    NOT?: TablaMaestraWhereInput | TablaMaestraWhereInput[]
    idTablaMaestra?: IntFilter<"TablaMaestra"> | number
    descripcion?: StringNullableFilter<"TablaMaestra"> | string | null
    estado?: BoolFilter<"TablaMaestra"> | boolean
    creadoPorId?: IntFilter<"TablaMaestra"> | number
    actualizadoPorId?: IntNullableFilter<"TablaMaestra"> | number | null
    fechaCreacion?: DateTimeFilter<"TablaMaestra"> | Date | string
    fechaModificacion?: DateTimeNullableFilter<"TablaMaestra"> | Date | string | null
    TablaMaestraDetalle?: TablaMaestraDetalleListRelationFilter
  }

  export type TablaMaestraOrderByWithRelationInput = {
    idTablaMaestra?: SortOrder
    descripcion?: SortOrderInput | SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrderInput | SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrderInput | SortOrder
    TablaMaestraDetalle?: TablaMaestraDetalleOrderByRelationAggregateInput
  }

  export type TablaMaestraWhereUniqueInput = Prisma.AtLeast<{
    idTablaMaestra?: number
    AND?: TablaMaestraWhereInput | TablaMaestraWhereInput[]
    OR?: TablaMaestraWhereInput[]
    NOT?: TablaMaestraWhereInput | TablaMaestraWhereInput[]
    descripcion?: StringNullableFilter<"TablaMaestra"> | string | null
    estado?: BoolFilter<"TablaMaestra"> | boolean
    creadoPorId?: IntFilter<"TablaMaestra"> | number
    actualizadoPorId?: IntNullableFilter<"TablaMaestra"> | number | null
    fechaCreacion?: DateTimeFilter<"TablaMaestra"> | Date | string
    fechaModificacion?: DateTimeNullableFilter<"TablaMaestra"> | Date | string | null
    TablaMaestraDetalle?: TablaMaestraDetalleListRelationFilter
  }, "idTablaMaestra">

  export type TablaMaestraOrderByWithAggregationInput = {
    idTablaMaestra?: SortOrder
    descripcion?: SortOrderInput | SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrderInput | SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrderInput | SortOrder
    _count?: TablaMaestraCountOrderByAggregateInput
    _avg?: TablaMaestraAvgOrderByAggregateInput
    _max?: TablaMaestraMaxOrderByAggregateInput
    _min?: TablaMaestraMinOrderByAggregateInput
    _sum?: TablaMaestraSumOrderByAggregateInput
  }

  export type TablaMaestraScalarWhereWithAggregatesInput = {
    AND?: TablaMaestraScalarWhereWithAggregatesInput | TablaMaestraScalarWhereWithAggregatesInput[]
    OR?: TablaMaestraScalarWhereWithAggregatesInput[]
    NOT?: TablaMaestraScalarWhereWithAggregatesInput | TablaMaestraScalarWhereWithAggregatesInput[]
    idTablaMaestra?: IntWithAggregatesFilter<"TablaMaestra"> | number
    descripcion?: StringNullableWithAggregatesFilter<"TablaMaestra"> | string | null
    estado?: BoolWithAggregatesFilter<"TablaMaestra"> | boolean
    creadoPorId?: IntWithAggregatesFilter<"TablaMaestra"> | number
    actualizadoPorId?: IntNullableWithAggregatesFilter<"TablaMaestra"> | number | null
    fechaCreacion?: DateTimeWithAggregatesFilter<"TablaMaestra"> | Date | string
    fechaModificacion?: DateTimeNullableWithAggregatesFilter<"TablaMaestra"> | Date | string | null
  }

  export type TablaMaestraDetalleWhereInput = {
    AND?: TablaMaestraDetalleWhereInput | TablaMaestraDetalleWhereInput[]
    OR?: TablaMaestraDetalleWhereInput[]
    NOT?: TablaMaestraDetalleWhereInput | TablaMaestraDetalleWhereInput[]
    idTablaMaestraDetalle?: IntFilter<"TablaMaestraDetalle"> | number
    descripcion?: StringNullableFilter<"TablaMaestraDetalle"> | string | null
    valor?: StringNullableFilter<"TablaMaestraDetalle"> | string | null
    idTablaMaestra?: IntFilter<"TablaMaestraDetalle"> | number
    estado?: BoolFilter<"TablaMaestraDetalle"> | boolean
    creadoPorId?: IntFilter<"TablaMaestraDetalle"> | number
    actualizadoPorId?: IntNullableFilter<"TablaMaestraDetalle"> | number | null
    fechaCreacion?: DateTimeFilter<"TablaMaestraDetalle"> | Date | string
    fechaModificacion?: DateTimeNullableFilter<"TablaMaestraDetalle"> | Date | string | null
    tablaMaestra?: XOR<TablaMaestraScalarRelationFilter, TablaMaestraWhereInput>
  }

  export type TablaMaestraDetalleOrderByWithRelationInput = {
    idTablaMaestraDetalle?: SortOrder
    descripcion?: SortOrderInput | SortOrder
    valor?: SortOrderInput | SortOrder
    idTablaMaestra?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrderInput | SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrderInput | SortOrder
    tablaMaestra?: TablaMaestraOrderByWithRelationInput
  }

  export type TablaMaestraDetalleWhereUniqueInput = Prisma.AtLeast<{
    idTablaMaestraDetalle?: number
    AND?: TablaMaestraDetalleWhereInput | TablaMaestraDetalleWhereInput[]
    OR?: TablaMaestraDetalleWhereInput[]
    NOT?: TablaMaestraDetalleWhereInput | TablaMaestraDetalleWhereInput[]
    descripcion?: StringNullableFilter<"TablaMaestraDetalle"> | string | null
    valor?: StringNullableFilter<"TablaMaestraDetalle"> | string | null
    idTablaMaestra?: IntFilter<"TablaMaestraDetalle"> | number
    estado?: BoolFilter<"TablaMaestraDetalle"> | boolean
    creadoPorId?: IntFilter<"TablaMaestraDetalle"> | number
    actualizadoPorId?: IntNullableFilter<"TablaMaestraDetalle"> | number | null
    fechaCreacion?: DateTimeFilter<"TablaMaestraDetalle"> | Date | string
    fechaModificacion?: DateTimeNullableFilter<"TablaMaestraDetalle"> | Date | string | null
    tablaMaestra?: XOR<TablaMaestraScalarRelationFilter, TablaMaestraWhereInput>
  }, "idTablaMaestraDetalle">

  export type TablaMaestraDetalleOrderByWithAggregationInput = {
    idTablaMaestraDetalle?: SortOrder
    descripcion?: SortOrderInput | SortOrder
    valor?: SortOrderInput | SortOrder
    idTablaMaestra?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrderInput | SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrderInput | SortOrder
    _count?: TablaMaestraDetalleCountOrderByAggregateInput
    _avg?: TablaMaestraDetalleAvgOrderByAggregateInput
    _max?: TablaMaestraDetalleMaxOrderByAggregateInput
    _min?: TablaMaestraDetalleMinOrderByAggregateInput
    _sum?: TablaMaestraDetalleSumOrderByAggregateInput
  }

  export type TablaMaestraDetalleScalarWhereWithAggregatesInput = {
    AND?: TablaMaestraDetalleScalarWhereWithAggregatesInput | TablaMaestraDetalleScalarWhereWithAggregatesInput[]
    OR?: TablaMaestraDetalleScalarWhereWithAggregatesInput[]
    NOT?: TablaMaestraDetalleScalarWhereWithAggregatesInput | TablaMaestraDetalleScalarWhereWithAggregatesInput[]
    idTablaMaestraDetalle?: IntWithAggregatesFilter<"TablaMaestraDetalle"> | number
    descripcion?: StringNullableWithAggregatesFilter<"TablaMaestraDetalle"> | string | null
    valor?: StringNullableWithAggregatesFilter<"TablaMaestraDetalle"> | string | null
    idTablaMaestra?: IntWithAggregatesFilter<"TablaMaestraDetalle"> | number
    estado?: BoolWithAggregatesFilter<"TablaMaestraDetalle"> | boolean
    creadoPorId?: IntWithAggregatesFilter<"TablaMaestraDetalle"> | number
    actualizadoPorId?: IntNullableWithAggregatesFilter<"TablaMaestraDetalle"> | number | null
    fechaCreacion?: DateTimeWithAggregatesFilter<"TablaMaestraDetalle"> | Date | string
    fechaModificacion?: DateTimeNullableWithAggregatesFilter<"TablaMaestraDetalle"> | Date | string | null
  }

  export type EmpleadoCreateInput = {
    nombres: string
    apellidoPaterno: string
    apellidoMaterno: string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    empresaEmpleadora: EmpresaEmpleadoraCreateNestedOneWithoutEmpleadoInput
    equipoEmpleadora: EquipoEmpleadoraCreateNestedOneWithoutEmpleadoInput
    puestoEmpleadora: PuestoEmpleadoraCreateNestedOneWithoutEmpleadoInput
    unidadEmpleadora: UnidadEmpleadoraCreateNestedOneWithoutEmpleadoInput
    usuario: UsuarioCreateNestedOneWithoutEmpleadoInput
    objetivo?: ObjetivoCreateNestedManyWithoutEmpleadoInput
  }

  export type EmpleadoUncheckedCreateInput = {
    idEmpleado?: number
    nombres: string
    apellidoPaterno: string
    apellidoMaterno: string
    idEmpresaEmpleadora: number
    idEquipoEmpleadora: number
    idPuestoEmpleadora: number
    idUnidadEmpleadora: number
    idUsuario: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    objetivo?: ObjetivoUncheckedCreateNestedManyWithoutEmpleadoInput
  }

  export type EmpleadoUpdateInput = {
    nombres?: StringFieldUpdateOperationsInput | string
    apellidoPaterno?: StringFieldUpdateOperationsInput | string
    apellidoMaterno?: StringFieldUpdateOperationsInput | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    empresaEmpleadora?: EmpresaEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput
    equipoEmpleadora?: EquipoEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput
    puestoEmpleadora?: PuestoEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput
    unidadEmpleadora?: UnidadEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput
    usuario?: UsuarioUpdateOneRequiredWithoutEmpleadoNestedInput
    objetivo?: ObjetivoUpdateManyWithoutEmpleadoNestedInput
  }

  export type EmpleadoUncheckedUpdateInput = {
    idEmpleado?: IntFieldUpdateOperationsInput | number
    nombres?: StringFieldUpdateOperationsInput | string
    apellidoPaterno?: StringFieldUpdateOperationsInput | string
    apellidoMaterno?: StringFieldUpdateOperationsInput | string
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    idEquipoEmpleadora?: IntFieldUpdateOperationsInput | number
    idPuestoEmpleadora?: IntFieldUpdateOperationsInput | number
    idUnidadEmpleadora?: IntFieldUpdateOperationsInput | number
    idUsuario?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    objetivo?: ObjetivoUncheckedUpdateManyWithoutEmpleadoNestedInput
  }

  export type EmpleadoCreateManyInput = {
    idEmpleado?: number
    nombres: string
    apellidoPaterno: string
    apellidoMaterno: string
    idEmpresaEmpleadora: number
    idEquipoEmpleadora: number
    idPuestoEmpleadora: number
    idUnidadEmpleadora: number
    idUsuario: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type EmpleadoUpdateManyMutationInput = {
    nombres?: StringFieldUpdateOperationsInput | string
    apellidoPaterno?: StringFieldUpdateOperationsInput | string
    apellidoMaterno?: StringFieldUpdateOperationsInput | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type EmpleadoUncheckedUpdateManyInput = {
    idEmpleado?: IntFieldUpdateOperationsInput | number
    nombres?: StringFieldUpdateOperationsInput | string
    apellidoPaterno?: StringFieldUpdateOperationsInput | string
    apellidoMaterno?: StringFieldUpdateOperationsInput | string
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    idEquipoEmpleadora?: IntFieldUpdateOperationsInput | number
    idPuestoEmpleadora?: IntFieldUpdateOperationsInput | number
    idUnidadEmpleadora?: IntFieldUpdateOperationsInput | number
    idUsuario?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UsuarioCreateInput = {
    codigoUsuario: string
    correoElectronico?: string | null
    contrasena: string
    rol?: $Enums.Rol
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    empleado?: EmpleadoCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateInput = {
    idUsuario?: number
    codigoUsuario: string
    correoElectronico?: string | null
    contrasena: string
    rol?: $Enums.Rol
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    empleado?: EmpleadoUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUpdateInput = {
    codigoUsuario?: StringFieldUpdateOperationsInput | string
    correoElectronico?: NullableStringFieldUpdateOperationsInput | string | null
    contrasena?: StringFieldUpdateOperationsInput | string
    rol?: EnumRolFieldUpdateOperationsInput | $Enums.Rol
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    empleado?: EmpleadoUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateInput = {
    idUsuario?: IntFieldUpdateOperationsInput | number
    codigoUsuario?: StringFieldUpdateOperationsInput | string
    correoElectronico?: NullableStringFieldUpdateOperationsInput | string | null
    contrasena?: StringFieldUpdateOperationsInput | string
    rol?: EnumRolFieldUpdateOperationsInput | $Enums.Rol
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    empleado?: EmpleadoUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioCreateManyInput = {
    idUsuario?: number
    codigoUsuario: string
    correoElectronico?: string | null
    contrasena: string
    rol?: $Enums.Rol
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type UsuarioUpdateManyMutationInput = {
    codigoUsuario?: StringFieldUpdateOperationsInput | string
    correoElectronico?: NullableStringFieldUpdateOperationsInput | string | null
    contrasena?: StringFieldUpdateOperationsInput | string
    rol?: EnumRolFieldUpdateOperationsInput | $Enums.Rol
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UsuarioUncheckedUpdateManyInput = {
    idUsuario?: IntFieldUpdateOperationsInput | number
    codigoUsuario?: StringFieldUpdateOperationsInput | string
    correoElectronico?: NullableStringFieldUpdateOperationsInput | string | null
    contrasena?: StringFieldUpdateOperationsInput | string
    rol?: EnumRolFieldUpdateOperationsInput | $Enums.Rol
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type EmpresaEmpleadoraCreateInput = {
    nombreEmpresa: string
    ruc?: string | null
    direccionEmpresa?: string | null
    urlLogo: string
    fechaVigenciaInicio: Date | string
    fechaVigenciaFin: Date | string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    equipoEmpleadora?: EquipoEmpleadoraCreateNestedManyWithoutEmpresaEmpleadoraInput
    puestoEmpleadora?: PuestoEmpleadoraCreateNestedManyWithoutEmpresaEmpleadoraInput
    unidadEmpleadora?: UnidadEmpleadoraCreateNestedManyWithoutEmpresaEmpleadoraInput
    objetivo?: ObjetivoCreateNestedManyWithoutEmpresaEmpleadoraInput
    empleado?: EmpleadoCreateNestedManyWithoutEmpresaEmpleadoraInput
  }

  export type EmpresaEmpleadoraUncheckedCreateInput = {
    idEmpresaEmpleadora?: number
    nombreEmpresa: string
    ruc?: string | null
    direccionEmpresa?: string | null
    urlLogo: string
    fechaVigenciaInicio: Date | string
    fechaVigenciaFin: Date | string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    equipoEmpleadora?: EquipoEmpleadoraUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput
    puestoEmpleadora?: PuestoEmpleadoraUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput
    unidadEmpleadora?: UnidadEmpleadoraUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput
    objetivo?: ObjetivoUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput
    empleado?: EmpleadoUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput
  }

  export type EmpresaEmpleadoraUpdateInput = {
    nombreEmpresa?: StringFieldUpdateOperationsInput | string
    ruc?: NullableStringFieldUpdateOperationsInput | string | null
    direccionEmpresa?: NullableStringFieldUpdateOperationsInput | string | null
    urlLogo?: StringFieldUpdateOperationsInput | string
    fechaVigenciaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVigenciaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    equipoEmpleadora?: EquipoEmpleadoraUpdateManyWithoutEmpresaEmpleadoraNestedInput
    puestoEmpleadora?: PuestoEmpleadoraUpdateManyWithoutEmpresaEmpleadoraNestedInput
    unidadEmpleadora?: UnidadEmpleadoraUpdateManyWithoutEmpresaEmpleadoraNestedInput
    objetivo?: ObjetivoUpdateManyWithoutEmpresaEmpleadoraNestedInput
    empleado?: EmpleadoUpdateManyWithoutEmpresaEmpleadoraNestedInput
  }

  export type EmpresaEmpleadoraUncheckedUpdateInput = {
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    nombreEmpresa?: StringFieldUpdateOperationsInput | string
    ruc?: NullableStringFieldUpdateOperationsInput | string | null
    direccionEmpresa?: NullableStringFieldUpdateOperationsInput | string | null
    urlLogo?: StringFieldUpdateOperationsInput | string
    fechaVigenciaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVigenciaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    equipoEmpleadora?: EquipoEmpleadoraUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput
    puestoEmpleadora?: PuestoEmpleadoraUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput
    unidadEmpleadora?: UnidadEmpleadoraUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput
    objetivo?: ObjetivoUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput
    empleado?: EmpleadoUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput
  }

  export type EmpresaEmpleadoraCreateManyInput = {
    idEmpresaEmpleadora?: number
    nombreEmpresa: string
    ruc?: string | null
    direccionEmpresa?: string | null
    urlLogo: string
    fechaVigenciaInicio: Date | string
    fechaVigenciaFin: Date | string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type EmpresaEmpleadoraUpdateManyMutationInput = {
    nombreEmpresa?: StringFieldUpdateOperationsInput | string
    ruc?: NullableStringFieldUpdateOperationsInput | string | null
    direccionEmpresa?: NullableStringFieldUpdateOperationsInput | string | null
    urlLogo?: StringFieldUpdateOperationsInput | string
    fechaVigenciaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVigenciaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type EmpresaEmpleadoraUncheckedUpdateManyInput = {
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    nombreEmpresa?: StringFieldUpdateOperationsInput | string
    ruc?: NullableStringFieldUpdateOperationsInput | string | null
    direccionEmpresa?: NullableStringFieldUpdateOperationsInput | string | null
    urlLogo?: StringFieldUpdateOperationsInput | string
    fechaVigenciaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVigenciaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type EquipoEmpleadoraCreateInput = {
    descripcion: string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    empresaEmpleadora: EmpresaEmpleadoraCreateNestedOneWithoutEquipoEmpleadoraInput
    Empleado?: EmpleadoCreateNestedManyWithoutEquipoEmpleadoraInput
  }

  export type EquipoEmpleadoraUncheckedCreateInput = {
    idEquipoEmpleadora?: number
    descripcion: string
    idEmpresaEmpleadora: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    Empleado?: EmpleadoUncheckedCreateNestedManyWithoutEquipoEmpleadoraInput
  }

  export type EquipoEmpleadoraUpdateInput = {
    descripcion?: StringFieldUpdateOperationsInput | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    empresaEmpleadora?: EmpresaEmpleadoraUpdateOneRequiredWithoutEquipoEmpleadoraNestedInput
    Empleado?: EmpleadoUpdateManyWithoutEquipoEmpleadoraNestedInput
  }

  export type EquipoEmpleadoraUncheckedUpdateInput = {
    idEquipoEmpleadora?: IntFieldUpdateOperationsInput | number
    descripcion?: StringFieldUpdateOperationsInput | string
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Empleado?: EmpleadoUncheckedUpdateManyWithoutEquipoEmpleadoraNestedInput
  }

  export type EquipoEmpleadoraCreateManyInput = {
    idEquipoEmpleadora?: number
    descripcion: string
    idEmpresaEmpleadora: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type EquipoEmpleadoraUpdateManyMutationInput = {
    descripcion?: StringFieldUpdateOperationsInput | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type EquipoEmpleadoraUncheckedUpdateManyInput = {
    idEquipoEmpleadora?: IntFieldUpdateOperationsInput | number
    descripcion?: StringFieldUpdateOperationsInput | string
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PuestoEmpleadoraCreateInput = {
    descripcion: string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    empresaEmpleadora: EmpresaEmpleadoraCreateNestedOneWithoutPuestoEmpleadoraInput
    Empleado?: EmpleadoCreateNestedManyWithoutPuestoEmpleadoraInput
  }

  export type PuestoEmpleadoraUncheckedCreateInput = {
    idPuestoEmpleadora?: number
    descripcion: string
    idEmpresaEmpleadora: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    Empleado?: EmpleadoUncheckedCreateNestedManyWithoutPuestoEmpleadoraInput
  }

  export type PuestoEmpleadoraUpdateInput = {
    descripcion?: StringFieldUpdateOperationsInput | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    empresaEmpleadora?: EmpresaEmpleadoraUpdateOneRequiredWithoutPuestoEmpleadoraNestedInput
    Empleado?: EmpleadoUpdateManyWithoutPuestoEmpleadoraNestedInput
  }

  export type PuestoEmpleadoraUncheckedUpdateInput = {
    idPuestoEmpleadora?: IntFieldUpdateOperationsInput | number
    descripcion?: StringFieldUpdateOperationsInput | string
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Empleado?: EmpleadoUncheckedUpdateManyWithoutPuestoEmpleadoraNestedInput
  }

  export type PuestoEmpleadoraCreateManyInput = {
    idPuestoEmpleadora?: number
    descripcion: string
    idEmpresaEmpleadora: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type PuestoEmpleadoraUpdateManyMutationInput = {
    descripcion?: StringFieldUpdateOperationsInput | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PuestoEmpleadoraUncheckedUpdateManyInput = {
    idPuestoEmpleadora?: IntFieldUpdateOperationsInput | number
    descripcion?: StringFieldUpdateOperationsInput | string
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UnidadEmpleadoraCreateInput = {
    descripcion: string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    empresaEmpleadora: EmpresaEmpleadoraCreateNestedOneWithoutUnidadEmpleadoraInput
    empleado?: EmpleadoCreateNestedManyWithoutUnidadEmpleadoraInput
  }

  export type UnidadEmpleadoraUncheckedCreateInput = {
    idUnidadEmpleadora?: number
    descripcion: string
    idEmpresaEmpleadora: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    empleado?: EmpleadoUncheckedCreateNestedManyWithoutUnidadEmpleadoraInput
  }

  export type UnidadEmpleadoraUpdateInput = {
    descripcion?: StringFieldUpdateOperationsInput | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    empresaEmpleadora?: EmpresaEmpleadoraUpdateOneRequiredWithoutUnidadEmpleadoraNestedInput
    empleado?: EmpleadoUpdateManyWithoutUnidadEmpleadoraNestedInput
  }

  export type UnidadEmpleadoraUncheckedUpdateInput = {
    idUnidadEmpleadora?: IntFieldUpdateOperationsInput | number
    descripcion?: StringFieldUpdateOperationsInput | string
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    empleado?: EmpleadoUncheckedUpdateManyWithoutUnidadEmpleadoraNestedInput
  }

  export type UnidadEmpleadoraCreateManyInput = {
    idUnidadEmpleadora?: number
    descripcion: string
    idEmpresaEmpleadora: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type UnidadEmpleadoraUpdateManyMutationInput = {
    descripcion?: StringFieldUpdateOperationsInput | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UnidadEmpleadoraUncheckedUpdateManyInput = {
    idUnidadEmpleadora?: IntFieldUpdateOperationsInput | number
    descripcion?: StringFieldUpdateOperationsInput | string
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ObjetivoCreateInput = {
    fechaVigenciaInicia: Date | string
    fechaVigenciaFin: Date | string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    empresaEmpleadora: EmpresaEmpleadoraCreateNestedOneWithoutObjetivoInput
    empleado: EmpleadoCreateNestedOneWithoutObjetivoInput
    ObjetivoDetalle?: ObjetivoDetalleCreateNestedManyWithoutObjetivoInput
  }

  export type ObjetivoUncheckedCreateInput = {
    idObjetivo?: number
    fechaVigenciaInicia: Date | string
    fechaVigenciaFin: Date | string
    idEmpresaEmpleadora: number
    idEmpleado: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    ObjetivoDetalle?: ObjetivoDetalleUncheckedCreateNestedManyWithoutObjetivoInput
  }

  export type ObjetivoUpdateInput = {
    fechaVigenciaInicia?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVigenciaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    empresaEmpleadora?: EmpresaEmpleadoraUpdateOneRequiredWithoutObjetivoNestedInput
    empleado?: EmpleadoUpdateOneRequiredWithoutObjetivoNestedInput
    ObjetivoDetalle?: ObjetivoDetalleUpdateManyWithoutObjetivoNestedInput
  }

  export type ObjetivoUncheckedUpdateInput = {
    idObjetivo?: IntFieldUpdateOperationsInput | number
    fechaVigenciaInicia?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVigenciaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    idEmpleado?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ObjetivoDetalle?: ObjetivoDetalleUncheckedUpdateManyWithoutObjetivoNestedInput
  }

  export type ObjetivoCreateManyInput = {
    idObjetivo?: number
    fechaVigenciaInicia: Date | string
    fechaVigenciaFin: Date | string
    idEmpresaEmpleadora: number
    idEmpleado: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type ObjetivoUpdateManyMutationInput = {
    fechaVigenciaInicia?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVigenciaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ObjetivoUncheckedUpdateManyInput = {
    idObjetivo?: IntFieldUpdateOperationsInput | number
    fechaVigenciaInicia?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVigenciaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    idEmpleado?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ObjetivoDetalleCreateInput = {
    secuencial: number
    descripcion?: string | null
    descripcionIniciativa?: string | null
    unidadMedida?: string | null
    pesoEspecifico?: number | null
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    objetivo: ObjetivoCreateNestedOneWithoutObjetivoDetalleInput
  }

  export type ObjetivoDetalleUncheckedCreateInput = {
    idObjetivoDetalle?: number
    idObjetivo: number
    secuencial: number
    descripcion?: string | null
    descripcionIniciativa?: string | null
    unidadMedida?: string | null
    pesoEspecifico?: number | null
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type ObjetivoDetalleUpdateInput = {
    secuencial?: IntFieldUpdateOperationsInput | number
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    descripcionIniciativa?: NullableStringFieldUpdateOperationsInput | string | null
    unidadMedida?: NullableStringFieldUpdateOperationsInput | string | null
    pesoEspecifico?: NullableFloatFieldUpdateOperationsInput | number | null
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    objetivo?: ObjetivoUpdateOneRequiredWithoutObjetivoDetalleNestedInput
  }

  export type ObjetivoDetalleUncheckedUpdateInput = {
    idObjetivoDetalle?: IntFieldUpdateOperationsInput | number
    idObjetivo?: IntFieldUpdateOperationsInput | number
    secuencial?: IntFieldUpdateOperationsInput | number
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    descripcionIniciativa?: NullableStringFieldUpdateOperationsInput | string | null
    unidadMedida?: NullableStringFieldUpdateOperationsInput | string | null
    pesoEspecifico?: NullableFloatFieldUpdateOperationsInput | number | null
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ObjetivoDetalleCreateManyInput = {
    idObjetivoDetalle?: number
    idObjetivo: number
    secuencial: number
    descripcion?: string | null
    descripcionIniciativa?: string | null
    unidadMedida?: string | null
    pesoEspecifico?: number | null
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type ObjetivoDetalleUpdateManyMutationInput = {
    secuencial?: IntFieldUpdateOperationsInput | number
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    descripcionIniciativa?: NullableStringFieldUpdateOperationsInput | string | null
    unidadMedida?: NullableStringFieldUpdateOperationsInput | string | null
    pesoEspecifico?: NullableFloatFieldUpdateOperationsInput | number | null
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ObjetivoDetalleUncheckedUpdateManyInput = {
    idObjetivoDetalle?: IntFieldUpdateOperationsInput | number
    idObjetivo?: IntFieldUpdateOperationsInput | number
    secuencial?: IntFieldUpdateOperationsInput | number
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    descripcionIniciativa?: NullableStringFieldUpdateOperationsInput | string | null
    unidadMedida?: NullableStringFieldUpdateOperationsInput | string | null
    pesoEspecifico?: NullableFloatFieldUpdateOperationsInput | number | null
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TablaMaestraCreateInput = {
    descripcion?: string | null
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    TablaMaestraDetalle?: TablaMaestraDetalleCreateNestedManyWithoutTablaMaestraInput
  }

  export type TablaMaestraUncheckedCreateInput = {
    idTablaMaestra?: number
    descripcion?: string | null
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    TablaMaestraDetalle?: TablaMaestraDetalleUncheckedCreateNestedManyWithoutTablaMaestraInput
  }

  export type TablaMaestraUpdateInput = {
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    TablaMaestraDetalle?: TablaMaestraDetalleUpdateManyWithoutTablaMaestraNestedInput
  }

  export type TablaMaestraUncheckedUpdateInput = {
    idTablaMaestra?: IntFieldUpdateOperationsInput | number
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    TablaMaestraDetalle?: TablaMaestraDetalleUncheckedUpdateManyWithoutTablaMaestraNestedInput
  }

  export type TablaMaestraCreateManyInput = {
    idTablaMaestra?: number
    descripcion?: string | null
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type TablaMaestraUpdateManyMutationInput = {
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TablaMaestraUncheckedUpdateManyInput = {
    idTablaMaestra?: IntFieldUpdateOperationsInput | number
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TablaMaestraDetalleCreateInput = {
    descripcion?: string | null
    valor?: string | null
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    tablaMaestra: TablaMaestraCreateNestedOneWithoutTablaMaestraDetalleInput
  }

  export type TablaMaestraDetalleUncheckedCreateInput = {
    idTablaMaestraDetalle?: number
    descripcion?: string | null
    valor?: string | null
    idTablaMaestra: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type TablaMaestraDetalleUpdateInput = {
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    valor?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tablaMaestra?: TablaMaestraUpdateOneRequiredWithoutTablaMaestraDetalleNestedInput
  }

  export type TablaMaestraDetalleUncheckedUpdateInput = {
    idTablaMaestraDetalle?: IntFieldUpdateOperationsInput | number
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    valor?: NullableStringFieldUpdateOperationsInput | string | null
    idTablaMaestra?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TablaMaestraDetalleCreateManyInput = {
    idTablaMaestraDetalle?: number
    descripcion?: string | null
    valor?: string | null
    idTablaMaestra: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type TablaMaestraDetalleUpdateManyMutationInput = {
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    valor?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TablaMaestraDetalleUncheckedUpdateManyInput = {
    idTablaMaestraDetalle?: IntFieldUpdateOperationsInput | number
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    valor?: NullableStringFieldUpdateOperationsInput | string | null
    idTablaMaestra?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type EmpresaEmpleadoraScalarRelationFilter = {
    is?: EmpresaEmpleadoraWhereInput
    isNot?: EmpresaEmpleadoraWhereInput
  }

  export type EquipoEmpleadoraScalarRelationFilter = {
    is?: EquipoEmpleadoraWhereInput
    isNot?: EquipoEmpleadoraWhereInput
  }

  export type PuestoEmpleadoraScalarRelationFilter = {
    is?: PuestoEmpleadoraWhereInput
    isNot?: PuestoEmpleadoraWhereInput
  }

  export type UnidadEmpleadoraScalarRelationFilter = {
    is?: UnidadEmpleadoraWhereInput
    isNot?: UnidadEmpleadoraWhereInput
  }

  export type UsuarioScalarRelationFilter = {
    is?: UsuarioWhereInput
    isNot?: UsuarioWhereInput
  }

  export type ObjetivoListRelationFilter = {
    every?: ObjetivoWhereInput
    some?: ObjetivoWhereInput
    none?: ObjetivoWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ObjetivoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EmpleadoCountOrderByAggregateInput = {
    idEmpleado?: SortOrder
    nombres?: SortOrder
    apellidoPaterno?: SortOrder
    apellidoMaterno?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    idEquipoEmpleadora?: SortOrder
    idPuestoEmpleadora?: SortOrder
    idUnidadEmpleadora?: SortOrder
    idUsuario?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type EmpleadoAvgOrderByAggregateInput = {
    idEmpleado?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    idEquipoEmpleadora?: SortOrder
    idPuestoEmpleadora?: SortOrder
    idUnidadEmpleadora?: SortOrder
    idUsuario?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
  }

  export type EmpleadoMaxOrderByAggregateInput = {
    idEmpleado?: SortOrder
    nombres?: SortOrder
    apellidoPaterno?: SortOrder
    apellidoMaterno?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    idEquipoEmpleadora?: SortOrder
    idPuestoEmpleadora?: SortOrder
    idUnidadEmpleadora?: SortOrder
    idUsuario?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type EmpleadoMinOrderByAggregateInput = {
    idEmpleado?: SortOrder
    nombres?: SortOrder
    apellidoPaterno?: SortOrder
    apellidoMaterno?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    idEquipoEmpleadora?: SortOrder
    idPuestoEmpleadora?: SortOrder
    idUnidadEmpleadora?: SortOrder
    idUsuario?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type EmpleadoSumOrderByAggregateInput = {
    idEmpleado?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    idEquipoEmpleadora?: SortOrder
    idPuestoEmpleadora?: SortOrder
    idUnidadEmpleadora?: SortOrder
    idUsuario?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type EnumRolFilter<$PrismaModel = never> = {
    equals?: $Enums.Rol | EnumRolFieldRefInput<$PrismaModel>
    in?: $Enums.Rol[] | ListEnumRolFieldRefInput<$PrismaModel>
    notIn?: $Enums.Rol[] | ListEnumRolFieldRefInput<$PrismaModel>
    not?: NestedEnumRolFilter<$PrismaModel> | $Enums.Rol
  }

  export type EmpleadoListRelationFilter = {
    every?: EmpleadoWhereInput
    some?: EmpleadoWhereInput
    none?: EmpleadoWhereInput
  }

  export type EmpleadoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UsuarioCountOrderByAggregateInput = {
    idUsuario?: SortOrder
    codigoUsuario?: SortOrder
    correoElectronico?: SortOrder
    contrasena?: SortOrder
    rol?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type UsuarioAvgOrderByAggregateInput = {
    idUsuario?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
  }

  export type UsuarioMaxOrderByAggregateInput = {
    idUsuario?: SortOrder
    codigoUsuario?: SortOrder
    correoElectronico?: SortOrder
    contrasena?: SortOrder
    rol?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type UsuarioMinOrderByAggregateInput = {
    idUsuario?: SortOrder
    codigoUsuario?: SortOrder
    correoElectronico?: SortOrder
    contrasena?: SortOrder
    rol?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type UsuarioSumOrderByAggregateInput = {
    idUsuario?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumRolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Rol | EnumRolFieldRefInput<$PrismaModel>
    in?: $Enums.Rol[] | ListEnumRolFieldRefInput<$PrismaModel>
    notIn?: $Enums.Rol[] | ListEnumRolFieldRefInput<$PrismaModel>
    not?: NestedEnumRolWithAggregatesFilter<$PrismaModel> | $Enums.Rol
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRolFilter<$PrismaModel>
    _max?: NestedEnumRolFilter<$PrismaModel>
  }

  export type EquipoEmpleadoraListRelationFilter = {
    every?: EquipoEmpleadoraWhereInput
    some?: EquipoEmpleadoraWhereInput
    none?: EquipoEmpleadoraWhereInput
  }

  export type PuestoEmpleadoraListRelationFilter = {
    every?: PuestoEmpleadoraWhereInput
    some?: PuestoEmpleadoraWhereInput
    none?: PuestoEmpleadoraWhereInput
  }

  export type UnidadEmpleadoraListRelationFilter = {
    every?: UnidadEmpleadoraWhereInput
    some?: UnidadEmpleadoraWhereInput
    none?: UnidadEmpleadoraWhereInput
  }

  export type EquipoEmpleadoraOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PuestoEmpleadoraOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UnidadEmpleadoraOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EmpresaEmpleadoraCountOrderByAggregateInput = {
    idEmpresaEmpleadora?: SortOrder
    nombreEmpresa?: SortOrder
    ruc?: SortOrder
    direccionEmpresa?: SortOrder
    urlLogo?: SortOrder
    fechaVigenciaInicio?: SortOrder
    fechaVigenciaFin?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type EmpresaEmpleadoraAvgOrderByAggregateInput = {
    idEmpresaEmpleadora?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
  }

  export type EmpresaEmpleadoraMaxOrderByAggregateInput = {
    idEmpresaEmpleadora?: SortOrder
    nombreEmpresa?: SortOrder
    ruc?: SortOrder
    direccionEmpresa?: SortOrder
    urlLogo?: SortOrder
    fechaVigenciaInicio?: SortOrder
    fechaVigenciaFin?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type EmpresaEmpleadoraMinOrderByAggregateInput = {
    idEmpresaEmpleadora?: SortOrder
    nombreEmpresa?: SortOrder
    ruc?: SortOrder
    direccionEmpresa?: SortOrder
    urlLogo?: SortOrder
    fechaVigenciaInicio?: SortOrder
    fechaVigenciaFin?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type EmpresaEmpleadoraSumOrderByAggregateInput = {
    idEmpresaEmpleadora?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
  }

  export type EquipoEmpleadoraCountOrderByAggregateInput = {
    idEquipoEmpleadora?: SortOrder
    descripcion?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type EquipoEmpleadoraAvgOrderByAggregateInput = {
    idEquipoEmpleadora?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
  }

  export type EquipoEmpleadoraMaxOrderByAggregateInput = {
    idEquipoEmpleadora?: SortOrder
    descripcion?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type EquipoEmpleadoraMinOrderByAggregateInput = {
    idEquipoEmpleadora?: SortOrder
    descripcion?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type EquipoEmpleadoraSumOrderByAggregateInput = {
    idEquipoEmpleadora?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
  }

  export type PuestoEmpleadoraCountOrderByAggregateInput = {
    idPuestoEmpleadora?: SortOrder
    descripcion?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type PuestoEmpleadoraAvgOrderByAggregateInput = {
    idPuestoEmpleadora?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
  }

  export type PuestoEmpleadoraMaxOrderByAggregateInput = {
    idPuestoEmpleadora?: SortOrder
    descripcion?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type PuestoEmpleadoraMinOrderByAggregateInput = {
    idPuestoEmpleadora?: SortOrder
    descripcion?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type PuestoEmpleadoraSumOrderByAggregateInput = {
    idPuestoEmpleadora?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
  }

  export type UnidadEmpleadoraCountOrderByAggregateInput = {
    idUnidadEmpleadora?: SortOrder
    descripcion?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type UnidadEmpleadoraAvgOrderByAggregateInput = {
    idUnidadEmpleadora?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
  }

  export type UnidadEmpleadoraMaxOrderByAggregateInput = {
    idUnidadEmpleadora?: SortOrder
    descripcion?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type UnidadEmpleadoraMinOrderByAggregateInput = {
    idUnidadEmpleadora?: SortOrder
    descripcion?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type UnidadEmpleadoraSumOrderByAggregateInput = {
    idUnidadEmpleadora?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
  }

  export type EmpleadoScalarRelationFilter = {
    is?: EmpleadoWhereInput
    isNot?: EmpleadoWhereInput
  }

  export type ObjetivoDetalleListRelationFilter = {
    every?: ObjetivoDetalleWhereInput
    some?: ObjetivoDetalleWhereInput
    none?: ObjetivoDetalleWhereInput
  }

  export type ObjetivoDetalleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ObjetivoCountOrderByAggregateInput = {
    idObjetivo?: SortOrder
    fechaVigenciaInicia?: SortOrder
    fechaVigenciaFin?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    idEmpleado?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type ObjetivoAvgOrderByAggregateInput = {
    idObjetivo?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    idEmpleado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
  }

  export type ObjetivoMaxOrderByAggregateInput = {
    idObjetivo?: SortOrder
    fechaVigenciaInicia?: SortOrder
    fechaVigenciaFin?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    idEmpleado?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type ObjetivoMinOrderByAggregateInput = {
    idObjetivo?: SortOrder
    fechaVigenciaInicia?: SortOrder
    fechaVigenciaFin?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    idEmpleado?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type ObjetivoSumOrderByAggregateInput = {
    idObjetivo?: SortOrder
    idEmpresaEmpleadora?: SortOrder
    idEmpleado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type ObjetivoScalarRelationFilter = {
    is?: ObjetivoWhereInput
    isNot?: ObjetivoWhereInput
  }

  export type ObjetivoDetalleCountOrderByAggregateInput = {
    idObjetivoDetalle?: SortOrder
    idObjetivo?: SortOrder
    secuencial?: SortOrder
    descripcion?: SortOrder
    descripcionIniciativa?: SortOrder
    unidadMedida?: SortOrder
    pesoEspecifico?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type ObjetivoDetalleAvgOrderByAggregateInput = {
    idObjetivoDetalle?: SortOrder
    idObjetivo?: SortOrder
    secuencial?: SortOrder
    pesoEspecifico?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
  }

  export type ObjetivoDetalleMaxOrderByAggregateInput = {
    idObjetivoDetalle?: SortOrder
    idObjetivo?: SortOrder
    secuencial?: SortOrder
    descripcion?: SortOrder
    descripcionIniciativa?: SortOrder
    unidadMedida?: SortOrder
    pesoEspecifico?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type ObjetivoDetalleMinOrderByAggregateInput = {
    idObjetivoDetalle?: SortOrder
    idObjetivo?: SortOrder
    secuencial?: SortOrder
    descripcion?: SortOrder
    descripcionIniciativa?: SortOrder
    unidadMedida?: SortOrder
    pesoEspecifico?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type ObjetivoDetalleSumOrderByAggregateInput = {
    idObjetivoDetalle?: SortOrder
    idObjetivo?: SortOrder
    secuencial?: SortOrder
    pesoEspecifico?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type TablaMaestraDetalleListRelationFilter = {
    every?: TablaMaestraDetalleWhereInput
    some?: TablaMaestraDetalleWhereInput
    none?: TablaMaestraDetalleWhereInput
  }

  export type TablaMaestraDetalleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TablaMaestraCountOrderByAggregateInput = {
    idTablaMaestra?: SortOrder
    descripcion?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type TablaMaestraAvgOrderByAggregateInput = {
    idTablaMaestra?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
  }

  export type TablaMaestraMaxOrderByAggregateInput = {
    idTablaMaestra?: SortOrder
    descripcion?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type TablaMaestraMinOrderByAggregateInput = {
    idTablaMaestra?: SortOrder
    descripcion?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type TablaMaestraSumOrderByAggregateInput = {
    idTablaMaestra?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
  }

  export type TablaMaestraScalarRelationFilter = {
    is?: TablaMaestraWhereInput
    isNot?: TablaMaestraWhereInput
  }

  export type TablaMaestraDetalleCountOrderByAggregateInput = {
    idTablaMaestraDetalle?: SortOrder
    descripcion?: SortOrder
    valor?: SortOrder
    idTablaMaestra?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type TablaMaestraDetalleAvgOrderByAggregateInput = {
    idTablaMaestraDetalle?: SortOrder
    idTablaMaestra?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
  }

  export type TablaMaestraDetalleMaxOrderByAggregateInput = {
    idTablaMaestraDetalle?: SortOrder
    descripcion?: SortOrder
    valor?: SortOrder
    idTablaMaestra?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type TablaMaestraDetalleMinOrderByAggregateInput = {
    idTablaMaestraDetalle?: SortOrder
    descripcion?: SortOrder
    valor?: SortOrder
    idTablaMaestra?: SortOrder
    estado?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
    fechaCreacion?: SortOrder
    fechaModificacion?: SortOrder
  }

  export type TablaMaestraDetalleSumOrderByAggregateInput = {
    idTablaMaestraDetalle?: SortOrder
    idTablaMaestra?: SortOrder
    creadoPorId?: SortOrder
    actualizadoPorId?: SortOrder
  }

  export type EmpresaEmpleadoraCreateNestedOneWithoutEmpleadoInput = {
    create?: XOR<EmpresaEmpleadoraCreateWithoutEmpleadoInput, EmpresaEmpleadoraUncheckedCreateWithoutEmpleadoInput>
    connectOrCreate?: EmpresaEmpleadoraCreateOrConnectWithoutEmpleadoInput
    connect?: EmpresaEmpleadoraWhereUniqueInput
  }

  export type EquipoEmpleadoraCreateNestedOneWithoutEmpleadoInput = {
    create?: XOR<EquipoEmpleadoraCreateWithoutEmpleadoInput, EquipoEmpleadoraUncheckedCreateWithoutEmpleadoInput>
    connectOrCreate?: EquipoEmpleadoraCreateOrConnectWithoutEmpleadoInput
    connect?: EquipoEmpleadoraWhereUniqueInput
  }

  export type PuestoEmpleadoraCreateNestedOneWithoutEmpleadoInput = {
    create?: XOR<PuestoEmpleadoraCreateWithoutEmpleadoInput, PuestoEmpleadoraUncheckedCreateWithoutEmpleadoInput>
    connectOrCreate?: PuestoEmpleadoraCreateOrConnectWithoutEmpleadoInput
    connect?: PuestoEmpleadoraWhereUniqueInput
  }

  export type UnidadEmpleadoraCreateNestedOneWithoutEmpleadoInput = {
    create?: XOR<UnidadEmpleadoraCreateWithoutEmpleadoInput, UnidadEmpleadoraUncheckedCreateWithoutEmpleadoInput>
    connectOrCreate?: UnidadEmpleadoraCreateOrConnectWithoutEmpleadoInput
    connect?: UnidadEmpleadoraWhereUniqueInput
  }

  export type UsuarioCreateNestedOneWithoutEmpleadoInput = {
    create?: XOR<UsuarioCreateWithoutEmpleadoInput, UsuarioUncheckedCreateWithoutEmpleadoInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutEmpleadoInput
    connect?: UsuarioWhereUniqueInput
  }

  export type ObjetivoCreateNestedManyWithoutEmpleadoInput = {
    create?: XOR<ObjetivoCreateWithoutEmpleadoInput, ObjetivoUncheckedCreateWithoutEmpleadoInput> | ObjetivoCreateWithoutEmpleadoInput[] | ObjetivoUncheckedCreateWithoutEmpleadoInput[]
    connectOrCreate?: ObjetivoCreateOrConnectWithoutEmpleadoInput | ObjetivoCreateOrConnectWithoutEmpleadoInput[]
    createMany?: ObjetivoCreateManyEmpleadoInputEnvelope
    connect?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
  }

  export type ObjetivoUncheckedCreateNestedManyWithoutEmpleadoInput = {
    create?: XOR<ObjetivoCreateWithoutEmpleadoInput, ObjetivoUncheckedCreateWithoutEmpleadoInput> | ObjetivoCreateWithoutEmpleadoInput[] | ObjetivoUncheckedCreateWithoutEmpleadoInput[]
    connectOrCreate?: ObjetivoCreateOrConnectWithoutEmpleadoInput | ObjetivoCreateOrConnectWithoutEmpleadoInput[]
    createMany?: ObjetivoCreateManyEmpleadoInputEnvelope
    connect?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type EmpresaEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput = {
    create?: XOR<EmpresaEmpleadoraCreateWithoutEmpleadoInput, EmpresaEmpleadoraUncheckedCreateWithoutEmpleadoInput>
    connectOrCreate?: EmpresaEmpleadoraCreateOrConnectWithoutEmpleadoInput
    upsert?: EmpresaEmpleadoraUpsertWithoutEmpleadoInput
    connect?: EmpresaEmpleadoraWhereUniqueInput
    update?: XOR<XOR<EmpresaEmpleadoraUpdateToOneWithWhereWithoutEmpleadoInput, EmpresaEmpleadoraUpdateWithoutEmpleadoInput>, EmpresaEmpleadoraUncheckedUpdateWithoutEmpleadoInput>
  }

  export type EquipoEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput = {
    create?: XOR<EquipoEmpleadoraCreateWithoutEmpleadoInput, EquipoEmpleadoraUncheckedCreateWithoutEmpleadoInput>
    connectOrCreate?: EquipoEmpleadoraCreateOrConnectWithoutEmpleadoInput
    upsert?: EquipoEmpleadoraUpsertWithoutEmpleadoInput
    connect?: EquipoEmpleadoraWhereUniqueInput
    update?: XOR<XOR<EquipoEmpleadoraUpdateToOneWithWhereWithoutEmpleadoInput, EquipoEmpleadoraUpdateWithoutEmpleadoInput>, EquipoEmpleadoraUncheckedUpdateWithoutEmpleadoInput>
  }

  export type PuestoEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput = {
    create?: XOR<PuestoEmpleadoraCreateWithoutEmpleadoInput, PuestoEmpleadoraUncheckedCreateWithoutEmpleadoInput>
    connectOrCreate?: PuestoEmpleadoraCreateOrConnectWithoutEmpleadoInput
    upsert?: PuestoEmpleadoraUpsertWithoutEmpleadoInput
    connect?: PuestoEmpleadoraWhereUniqueInput
    update?: XOR<XOR<PuestoEmpleadoraUpdateToOneWithWhereWithoutEmpleadoInput, PuestoEmpleadoraUpdateWithoutEmpleadoInput>, PuestoEmpleadoraUncheckedUpdateWithoutEmpleadoInput>
  }

  export type UnidadEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput = {
    create?: XOR<UnidadEmpleadoraCreateWithoutEmpleadoInput, UnidadEmpleadoraUncheckedCreateWithoutEmpleadoInput>
    connectOrCreate?: UnidadEmpleadoraCreateOrConnectWithoutEmpleadoInput
    upsert?: UnidadEmpleadoraUpsertWithoutEmpleadoInput
    connect?: UnidadEmpleadoraWhereUniqueInput
    update?: XOR<XOR<UnidadEmpleadoraUpdateToOneWithWhereWithoutEmpleadoInput, UnidadEmpleadoraUpdateWithoutEmpleadoInput>, UnidadEmpleadoraUncheckedUpdateWithoutEmpleadoInput>
  }

  export type UsuarioUpdateOneRequiredWithoutEmpleadoNestedInput = {
    create?: XOR<UsuarioCreateWithoutEmpleadoInput, UsuarioUncheckedCreateWithoutEmpleadoInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutEmpleadoInput
    upsert?: UsuarioUpsertWithoutEmpleadoInput
    connect?: UsuarioWhereUniqueInput
    update?: XOR<XOR<UsuarioUpdateToOneWithWhereWithoutEmpleadoInput, UsuarioUpdateWithoutEmpleadoInput>, UsuarioUncheckedUpdateWithoutEmpleadoInput>
  }

  export type ObjetivoUpdateManyWithoutEmpleadoNestedInput = {
    create?: XOR<ObjetivoCreateWithoutEmpleadoInput, ObjetivoUncheckedCreateWithoutEmpleadoInput> | ObjetivoCreateWithoutEmpleadoInput[] | ObjetivoUncheckedCreateWithoutEmpleadoInput[]
    connectOrCreate?: ObjetivoCreateOrConnectWithoutEmpleadoInput | ObjetivoCreateOrConnectWithoutEmpleadoInput[]
    upsert?: ObjetivoUpsertWithWhereUniqueWithoutEmpleadoInput | ObjetivoUpsertWithWhereUniqueWithoutEmpleadoInput[]
    createMany?: ObjetivoCreateManyEmpleadoInputEnvelope
    set?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    disconnect?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    delete?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    connect?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    update?: ObjetivoUpdateWithWhereUniqueWithoutEmpleadoInput | ObjetivoUpdateWithWhereUniqueWithoutEmpleadoInput[]
    updateMany?: ObjetivoUpdateManyWithWhereWithoutEmpleadoInput | ObjetivoUpdateManyWithWhereWithoutEmpleadoInput[]
    deleteMany?: ObjetivoScalarWhereInput | ObjetivoScalarWhereInput[]
  }

  export type ObjetivoUncheckedUpdateManyWithoutEmpleadoNestedInput = {
    create?: XOR<ObjetivoCreateWithoutEmpleadoInput, ObjetivoUncheckedCreateWithoutEmpleadoInput> | ObjetivoCreateWithoutEmpleadoInput[] | ObjetivoUncheckedCreateWithoutEmpleadoInput[]
    connectOrCreate?: ObjetivoCreateOrConnectWithoutEmpleadoInput | ObjetivoCreateOrConnectWithoutEmpleadoInput[]
    upsert?: ObjetivoUpsertWithWhereUniqueWithoutEmpleadoInput | ObjetivoUpsertWithWhereUniqueWithoutEmpleadoInput[]
    createMany?: ObjetivoCreateManyEmpleadoInputEnvelope
    set?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    disconnect?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    delete?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    connect?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    update?: ObjetivoUpdateWithWhereUniqueWithoutEmpleadoInput | ObjetivoUpdateWithWhereUniqueWithoutEmpleadoInput[]
    updateMany?: ObjetivoUpdateManyWithWhereWithoutEmpleadoInput | ObjetivoUpdateManyWithWhereWithoutEmpleadoInput[]
    deleteMany?: ObjetivoScalarWhereInput | ObjetivoScalarWhereInput[]
  }

  export type EmpleadoCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<EmpleadoCreateWithoutUsuarioInput, EmpleadoUncheckedCreateWithoutUsuarioInput> | EmpleadoCreateWithoutUsuarioInput[] | EmpleadoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: EmpleadoCreateOrConnectWithoutUsuarioInput | EmpleadoCreateOrConnectWithoutUsuarioInput[]
    createMany?: EmpleadoCreateManyUsuarioInputEnvelope
    connect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
  }

  export type EmpleadoUncheckedCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<EmpleadoCreateWithoutUsuarioInput, EmpleadoUncheckedCreateWithoutUsuarioInput> | EmpleadoCreateWithoutUsuarioInput[] | EmpleadoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: EmpleadoCreateOrConnectWithoutUsuarioInput | EmpleadoCreateOrConnectWithoutUsuarioInput[]
    createMany?: EmpleadoCreateManyUsuarioInputEnvelope
    connect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type EnumRolFieldUpdateOperationsInput = {
    set?: $Enums.Rol
  }

  export type EmpleadoUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<EmpleadoCreateWithoutUsuarioInput, EmpleadoUncheckedCreateWithoutUsuarioInput> | EmpleadoCreateWithoutUsuarioInput[] | EmpleadoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: EmpleadoCreateOrConnectWithoutUsuarioInput | EmpleadoCreateOrConnectWithoutUsuarioInput[]
    upsert?: EmpleadoUpsertWithWhereUniqueWithoutUsuarioInput | EmpleadoUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: EmpleadoCreateManyUsuarioInputEnvelope
    set?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    disconnect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    delete?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    connect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    update?: EmpleadoUpdateWithWhereUniqueWithoutUsuarioInput | EmpleadoUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: EmpleadoUpdateManyWithWhereWithoutUsuarioInput | EmpleadoUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: EmpleadoScalarWhereInput | EmpleadoScalarWhereInput[]
  }

  export type EmpleadoUncheckedUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<EmpleadoCreateWithoutUsuarioInput, EmpleadoUncheckedCreateWithoutUsuarioInput> | EmpleadoCreateWithoutUsuarioInput[] | EmpleadoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: EmpleadoCreateOrConnectWithoutUsuarioInput | EmpleadoCreateOrConnectWithoutUsuarioInput[]
    upsert?: EmpleadoUpsertWithWhereUniqueWithoutUsuarioInput | EmpleadoUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: EmpleadoCreateManyUsuarioInputEnvelope
    set?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    disconnect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    delete?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    connect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    update?: EmpleadoUpdateWithWhereUniqueWithoutUsuarioInput | EmpleadoUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: EmpleadoUpdateManyWithWhereWithoutUsuarioInput | EmpleadoUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: EmpleadoScalarWhereInput | EmpleadoScalarWhereInput[]
  }

  export type EquipoEmpleadoraCreateNestedManyWithoutEmpresaEmpleadoraInput = {
    create?: XOR<EquipoEmpleadoraCreateWithoutEmpresaEmpleadoraInput, EquipoEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput> | EquipoEmpleadoraCreateWithoutEmpresaEmpleadoraInput[] | EquipoEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput[]
    connectOrCreate?: EquipoEmpleadoraCreateOrConnectWithoutEmpresaEmpleadoraInput | EquipoEmpleadoraCreateOrConnectWithoutEmpresaEmpleadoraInput[]
    createMany?: EquipoEmpleadoraCreateManyEmpresaEmpleadoraInputEnvelope
    connect?: EquipoEmpleadoraWhereUniqueInput | EquipoEmpleadoraWhereUniqueInput[]
  }

  export type PuestoEmpleadoraCreateNestedManyWithoutEmpresaEmpleadoraInput = {
    create?: XOR<PuestoEmpleadoraCreateWithoutEmpresaEmpleadoraInput, PuestoEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput> | PuestoEmpleadoraCreateWithoutEmpresaEmpleadoraInput[] | PuestoEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput[]
    connectOrCreate?: PuestoEmpleadoraCreateOrConnectWithoutEmpresaEmpleadoraInput | PuestoEmpleadoraCreateOrConnectWithoutEmpresaEmpleadoraInput[]
    createMany?: PuestoEmpleadoraCreateManyEmpresaEmpleadoraInputEnvelope
    connect?: PuestoEmpleadoraWhereUniqueInput | PuestoEmpleadoraWhereUniqueInput[]
  }

  export type UnidadEmpleadoraCreateNestedManyWithoutEmpresaEmpleadoraInput = {
    create?: XOR<UnidadEmpleadoraCreateWithoutEmpresaEmpleadoraInput, UnidadEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput> | UnidadEmpleadoraCreateWithoutEmpresaEmpleadoraInput[] | UnidadEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput[]
    connectOrCreate?: UnidadEmpleadoraCreateOrConnectWithoutEmpresaEmpleadoraInput | UnidadEmpleadoraCreateOrConnectWithoutEmpresaEmpleadoraInput[]
    createMany?: UnidadEmpleadoraCreateManyEmpresaEmpleadoraInputEnvelope
    connect?: UnidadEmpleadoraWhereUniqueInput | UnidadEmpleadoraWhereUniqueInput[]
  }

  export type ObjetivoCreateNestedManyWithoutEmpresaEmpleadoraInput = {
    create?: XOR<ObjetivoCreateWithoutEmpresaEmpleadoraInput, ObjetivoUncheckedCreateWithoutEmpresaEmpleadoraInput> | ObjetivoCreateWithoutEmpresaEmpleadoraInput[] | ObjetivoUncheckedCreateWithoutEmpresaEmpleadoraInput[]
    connectOrCreate?: ObjetivoCreateOrConnectWithoutEmpresaEmpleadoraInput | ObjetivoCreateOrConnectWithoutEmpresaEmpleadoraInput[]
    createMany?: ObjetivoCreateManyEmpresaEmpleadoraInputEnvelope
    connect?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
  }

  export type EmpleadoCreateNestedManyWithoutEmpresaEmpleadoraInput = {
    create?: XOR<EmpleadoCreateWithoutEmpresaEmpleadoraInput, EmpleadoUncheckedCreateWithoutEmpresaEmpleadoraInput> | EmpleadoCreateWithoutEmpresaEmpleadoraInput[] | EmpleadoUncheckedCreateWithoutEmpresaEmpleadoraInput[]
    connectOrCreate?: EmpleadoCreateOrConnectWithoutEmpresaEmpleadoraInput | EmpleadoCreateOrConnectWithoutEmpresaEmpleadoraInput[]
    createMany?: EmpleadoCreateManyEmpresaEmpleadoraInputEnvelope
    connect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
  }

  export type EquipoEmpleadoraUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput = {
    create?: XOR<EquipoEmpleadoraCreateWithoutEmpresaEmpleadoraInput, EquipoEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput> | EquipoEmpleadoraCreateWithoutEmpresaEmpleadoraInput[] | EquipoEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput[]
    connectOrCreate?: EquipoEmpleadoraCreateOrConnectWithoutEmpresaEmpleadoraInput | EquipoEmpleadoraCreateOrConnectWithoutEmpresaEmpleadoraInput[]
    createMany?: EquipoEmpleadoraCreateManyEmpresaEmpleadoraInputEnvelope
    connect?: EquipoEmpleadoraWhereUniqueInput | EquipoEmpleadoraWhereUniqueInput[]
  }

  export type PuestoEmpleadoraUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput = {
    create?: XOR<PuestoEmpleadoraCreateWithoutEmpresaEmpleadoraInput, PuestoEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput> | PuestoEmpleadoraCreateWithoutEmpresaEmpleadoraInput[] | PuestoEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput[]
    connectOrCreate?: PuestoEmpleadoraCreateOrConnectWithoutEmpresaEmpleadoraInput | PuestoEmpleadoraCreateOrConnectWithoutEmpresaEmpleadoraInput[]
    createMany?: PuestoEmpleadoraCreateManyEmpresaEmpleadoraInputEnvelope
    connect?: PuestoEmpleadoraWhereUniqueInput | PuestoEmpleadoraWhereUniqueInput[]
  }

  export type UnidadEmpleadoraUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput = {
    create?: XOR<UnidadEmpleadoraCreateWithoutEmpresaEmpleadoraInput, UnidadEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput> | UnidadEmpleadoraCreateWithoutEmpresaEmpleadoraInput[] | UnidadEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput[]
    connectOrCreate?: UnidadEmpleadoraCreateOrConnectWithoutEmpresaEmpleadoraInput | UnidadEmpleadoraCreateOrConnectWithoutEmpresaEmpleadoraInput[]
    createMany?: UnidadEmpleadoraCreateManyEmpresaEmpleadoraInputEnvelope
    connect?: UnidadEmpleadoraWhereUniqueInput | UnidadEmpleadoraWhereUniqueInput[]
  }

  export type ObjetivoUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput = {
    create?: XOR<ObjetivoCreateWithoutEmpresaEmpleadoraInput, ObjetivoUncheckedCreateWithoutEmpresaEmpleadoraInput> | ObjetivoCreateWithoutEmpresaEmpleadoraInput[] | ObjetivoUncheckedCreateWithoutEmpresaEmpleadoraInput[]
    connectOrCreate?: ObjetivoCreateOrConnectWithoutEmpresaEmpleadoraInput | ObjetivoCreateOrConnectWithoutEmpresaEmpleadoraInput[]
    createMany?: ObjetivoCreateManyEmpresaEmpleadoraInputEnvelope
    connect?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
  }

  export type EmpleadoUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput = {
    create?: XOR<EmpleadoCreateWithoutEmpresaEmpleadoraInput, EmpleadoUncheckedCreateWithoutEmpresaEmpleadoraInput> | EmpleadoCreateWithoutEmpresaEmpleadoraInput[] | EmpleadoUncheckedCreateWithoutEmpresaEmpleadoraInput[]
    connectOrCreate?: EmpleadoCreateOrConnectWithoutEmpresaEmpleadoraInput | EmpleadoCreateOrConnectWithoutEmpresaEmpleadoraInput[]
    createMany?: EmpleadoCreateManyEmpresaEmpleadoraInputEnvelope
    connect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
  }

  export type EquipoEmpleadoraUpdateManyWithoutEmpresaEmpleadoraNestedInput = {
    create?: XOR<EquipoEmpleadoraCreateWithoutEmpresaEmpleadoraInput, EquipoEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput> | EquipoEmpleadoraCreateWithoutEmpresaEmpleadoraInput[] | EquipoEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput[]
    connectOrCreate?: EquipoEmpleadoraCreateOrConnectWithoutEmpresaEmpleadoraInput | EquipoEmpleadoraCreateOrConnectWithoutEmpresaEmpleadoraInput[]
    upsert?: EquipoEmpleadoraUpsertWithWhereUniqueWithoutEmpresaEmpleadoraInput | EquipoEmpleadoraUpsertWithWhereUniqueWithoutEmpresaEmpleadoraInput[]
    createMany?: EquipoEmpleadoraCreateManyEmpresaEmpleadoraInputEnvelope
    set?: EquipoEmpleadoraWhereUniqueInput | EquipoEmpleadoraWhereUniqueInput[]
    disconnect?: EquipoEmpleadoraWhereUniqueInput | EquipoEmpleadoraWhereUniqueInput[]
    delete?: EquipoEmpleadoraWhereUniqueInput | EquipoEmpleadoraWhereUniqueInput[]
    connect?: EquipoEmpleadoraWhereUniqueInput | EquipoEmpleadoraWhereUniqueInput[]
    update?: EquipoEmpleadoraUpdateWithWhereUniqueWithoutEmpresaEmpleadoraInput | EquipoEmpleadoraUpdateWithWhereUniqueWithoutEmpresaEmpleadoraInput[]
    updateMany?: EquipoEmpleadoraUpdateManyWithWhereWithoutEmpresaEmpleadoraInput | EquipoEmpleadoraUpdateManyWithWhereWithoutEmpresaEmpleadoraInput[]
    deleteMany?: EquipoEmpleadoraScalarWhereInput | EquipoEmpleadoraScalarWhereInput[]
  }

  export type PuestoEmpleadoraUpdateManyWithoutEmpresaEmpleadoraNestedInput = {
    create?: XOR<PuestoEmpleadoraCreateWithoutEmpresaEmpleadoraInput, PuestoEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput> | PuestoEmpleadoraCreateWithoutEmpresaEmpleadoraInput[] | PuestoEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput[]
    connectOrCreate?: PuestoEmpleadoraCreateOrConnectWithoutEmpresaEmpleadoraInput | PuestoEmpleadoraCreateOrConnectWithoutEmpresaEmpleadoraInput[]
    upsert?: PuestoEmpleadoraUpsertWithWhereUniqueWithoutEmpresaEmpleadoraInput | PuestoEmpleadoraUpsertWithWhereUniqueWithoutEmpresaEmpleadoraInput[]
    createMany?: PuestoEmpleadoraCreateManyEmpresaEmpleadoraInputEnvelope
    set?: PuestoEmpleadoraWhereUniqueInput | PuestoEmpleadoraWhereUniqueInput[]
    disconnect?: PuestoEmpleadoraWhereUniqueInput | PuestoEmpleadoraWhereUniqueInput[]
    delete?: PuestoEmpleadoraWhereUniqueInput | PuestoEmpleadoraWhereUniqueInput[]
    connect?: PuestoEmpleadoraWhereUniqueInput | PuestoEmpleadoraWhereUniqueInput[]
    update?: PuestoEmpleadoraUpdateWithWhereUniqueWithoutEmpresaEmpleadoraInput | PuestoEmpleadoraUpdateWithWhereUniqueWithoutEmpresaEmpleadoraInput[]
    updateMany?: PuestoEmpleadoraUpdateManyWithWhereWithoutEmpresaEmpleadoraInput | PuestoEmpleadoraUpdateManyWithWhereWithoutEmpresaEmpleadoraInput[]
    deleteMany?: PuestoEmpleadoraScalarWhereInput | PuestoEmpleadoraScalarWhereInput[]
  }

  export type UnidadEmpleadoraUpdateManyWithoutEmpresaEmpleadoraNestedInput = {
    create?: XOR<UnidadEmpleadoraCreateWithoutEmpresaEmpleadoraInput, UnidadEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput> | UnidadEmpleadoraCreateWithoutEmpresaEmpleadoraInput[] | UnidadEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput[]
    connectOrCreate?: UnidadEmpleadoraCreateOrConnectWithoutEmpresaEmpleadoraInput | UnidadEmpleadoraCreateOrConnectWithoutEmpresaEmpleadoraInput[]
    upsert?: UnidadEmpleadoraUpsertWithWhereUniqueWithoutEmpresaEmpleadoraInput | UnidadEmpleadoraUpsertWithWhereUniqueWithoutEmpresaEmpleadoraInput[]
    createMany?: UnidadEmpleadoraCreateManyEmpresaEmpleadoraInputEnvelope
    set?: UnidadEmpleadoraWhereUniqueInput | UnidadEmpleadoraWhereUniqueInput[]
    disconnect?: UnidadEmpleadoraWhereUniqueInput | UnidadEmpleadoraWhereUniqueInput[]
    delete?: UnidadEmpleadoraWhereUniqueInput | UnidadEmpleadoraWhereUniqueInput[]
    connect?: UnidadEmpleadoraWhereUniqueInput | UnidadEmpleadoraWhereUniqueInput[]
    update?: UnidadEmpleadoraUpdateWithWhereUniqueWithoutEmpresaEmpleadoraInput | UnidadEmpleadoraUpdateWithWhereUniqueWithoutEmpresaEmpleadoraInput[]
    updateMany?: UnidadEmpleadoraUpdateManyWithWhereWithoutEmpresaEmpleadoraInput | UnidadEmpleadoraUpdateManyWithWhereWithoutEmpresaEmpleadoraInput[]
    deleteMany?: UnidadEmpleadoraScalarWhereInput | UnidadEmpleadoraScalarWhereInput[]
  }

  export type ObjetivoUpdateManyWithoutEmpresaEmpleadoraNestedInput = {
    create?: XOR<ObjetivoCreateWithoutEmpresaEmpleadoraInput, ObjetivoUncheckedCreateWithoutEmpresaEmpleadoraInput> | ObjetivoCreateWithoutEmpresaEmpleadoraInput[] | ObjetivoUncheckedCreateWithoutEmpresaEmpleadoraInput[]
    connectOrCreate?: ObjetivoCreateOrConnectWithoutEmpresaEmpleadoraInput | ObjetivoCreateOrConnectWithoutEmpresaEmpleadoraInput[]
    upsert?: ObjetivoUpsertWithWhereUniqueWithoutEmpresaEmpleadoraInput | ObjetivoUpsertWithWhereUniqueWithoutEmpresaEmpleadoraInput[]
    createMany?: ObjetivoCreateManyEmpresaEmpleadoraInputEnvelope
    set?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    disconnect?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    delete?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    connect?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    update?: ObjetivoUpdateWithWhereUniqueWithoutEmpresaEmpleadoraInput | ObjetivoUpdateWithWhereUniqueWithoutEmpresaEmpleadoraInput[]
    updateMany?: ObjetivoUpdateManyWithWhereWithoutEmpresaEmpleadoraInput | ObjetivoUpdateManyWithWhereWithoutEmpresaEmpleadoraInput[]
    deleteMany?: ObjetivoScalarWhereInput | ObjetivoScalarWhereInput[]
  }

  export type EmpleadoUpdateManyWithoutEmpresaEmpleadoraNestedInput = {
    create?: XOR<EmpleadoCreateWithoutEmpresaEmpleadoraInput, EmpleadoUncheckedCreateWithoutEmpresaEmpleadoraInput> | EmpleadoCreateWithoutEmpresaEmpleadoraInput[] | EmpleadoUncheckedCreateWithoutEmpresaEmpleadoraInput[]
    connectOrCreate?: EmpleadoCreateOrConnectWithoutEmpresaEmpleadoraInput | EmpleadoCreateOrConnectWithoutEmpresaEmpleadoraInput[]
    upsert?: EmpleadoUpsertWithWhereUniqueWithoutEmpresaEmpleadoraInput | EmpleadoUpsertWithWhereUniqueWithoutEmpresaEmpleadoraInput[]
    createMany?: EmpleadoCreateManyEmpresaEmpleadoraInputEnvelope
    set?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    disconnect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    delete?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    connect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    update?: EmpleadoUpdateWithWhereUniqueWithoutEmpresaEmpleadoraInput | EmpleadoUpdateWithWhereUniqueWithoutEmpresaEmpleadoraInput[]
    updateMany?: EmpleadoUpdateManyWithWhereWithoutEmpresaEmpleadoraInput | EmpleadoUpdateManyWithWhereWithoutEmpresaEmpleadoraInput[]
    deleteMany?: EmpleadoScalarWhereInput | EmpleadoScalarWhereInput[]
  }

  export type EquipoEmpleadoraUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput = {
    create?: XOR<EquipoEmpleadoraCreateWithoutEmpresaEmpleadoraInput, EquipoEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput> | EquipoEmpleadoraCreateWithoutEmpresaEmpleadoraInput[] | EquipoEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput[]
    connectOrCreate?: EquipoEmpleadoraCreateOrConnectWithoutEmpresaEmpleadoraInput | EquipoEmpleadoraCreateOrConnectWithoutEmpresaEmpleadoraInput[]
    upsert?: EquipoEmpleadoraUpsertWithWhereUniqueWithoutEmpresaEmpleadoraInput | EquipoEmpleadoraUpsertWithWhereUniqueWithoutEmpresaEmpleadoraInput[]
    createMany?: EquipoEmpleadoraCreateManyEmpresaEmpleadoraInputEnvelope
    set?: EquipoEmpleadoraWhereUniqueInput | EquipoEmpleadoraWhereUniqueInput[]
    disconnect?: EquipoEmpleadoraWhereUniqueInput | EquipoEmpleadoraWhereUniqueInput[]
    delete?: EquipoEmpleadoraWhereUniqueInput | EquipoEmpleadoraWhereUniqueInput[]
    connect?: EquipoEmpleadoraWhereUniqueInput | EquipoEmpleadoraWhereUniqueInput[]
    update?: EquipoEmpleadoraUpdateWithWhereUniqueWithoutEmpresaEmpleadoraInput | EquipoEmpleadoraUpdateWithWhereUniqueWithoutEmpresaEmpleadoraInput[]
    updateMany?: EquipoEmpleadoraUpdateManyWithWhereWithoutEmpresaEmpleadoraInput | EquipoEmpleadoraUpdateManyWithWhereWithoutEmpresaEmpleadoraInput[]
    deleteMany?: EquipoEmpleadoraScalarWhereInput | EquipoEmpleadoraScalarWhereInput[]
  }

  export type PuestoEmpleadoraUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput = {
    create?: XOR<PuestoEmpleadoraCreateWithoutEmpresaEmpleadoraInput, PuestoEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput> | PuestoEmpleadoraCreateWithoutEmpresaEmpleadoraInput[] | PuestoEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput[]
    connectOrCreate?: PuestoEmpleadoraCreateOrConnectWithoutEmpresaEmpleadoraInput | PuestoEmpleadoraCreateOrConnectWithoutEmpresaEmpleadoraInput[]
    upsert?: PuestoEmpleadoraUpsertWithWhereUniqueWithoutEmpresaEmpleadoraInput | PuestoEmpleadoraUpsertWithWhereUniqueWithoutEmpresaEmpleadoraInput[]
    createMany?: PuestoEmpleadoraCreateManyEmpresaEmpleadoraInputEnvelope
    set?: PuestoEmpleadoraWhereUniqueInput | PuestoEmpleadoraWhereUniqueInput[]
    disconnect?: PuestoEmpleadoraWhereUniqueInput | PuestoEmpleadoraWhereUniqueInput[]
    delete?: PuestoEmpleadoraWhereUniqueInput | PuestoEmpleadoraWhereUniqueInput[]
    connect?: PuestoEmpleadoraWhereUniqueInput | PuestoEmpleadoraWhereUniqueInput[]
    update?: PuestoEmpleadoraUpdateWithWhereUniqueWithoutEmpresaEmpleadoraInput | PuestoEmpleadoraUpdateWithWhereUniqueWithoutEmpresaEmpleadoraInput[]
    updateMany?: PuestoEmpleadoraUpdateManyWithWhereWithoutEmpresaEmpleadoraInput | PuestoEmpleadoraUpdateManyWithWhereWithoutEmpresaEmpleadoraInput[]
    deleteMany?: PuestoEmpleadoraScalarWhereInput | PuestoEmpleadoraScalarWhereInput[]
  }

  export type UnidadEmpleadoraUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput = {
    create?: XOR<UnidadEmpleadoraCreateWithoutEmpresaEmpleadoraInput, UnidadEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput> | UnidadEmpleadoraCreateWithoutEmpresaEmpleadoraInput[] | UnidadEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput[]
    connectOrCreate?: UnidadEmpleadoraCreateOrConnectWithoutEmpresaEmpleadoraInput | UnidadEmpleadoraCreateOrConnectWithoutEmpresaEmpleadoraInput[]
    upsert?: UnidadEmpleadoraUpsertWithWhereUniqueWithoutEmpresaEmpleadoraInput | UnidadEmpleadoraUpsertWithWhereUniqueWithoutEmpresaEmpleadoraInput[]
    createMany?: UnidadEmpleadoraCreateManyEmpresaEmpleadoraInputEnvelope
    set?: UnidadEmpleadoraWhereUniqueInput | UnidadEmpleadoraWhereUniqueInput[]
    disconnect?: UnidadEmpleadoraWhereUniqueInput | UnidadEmpleadoraWhereUniqueInput[]
    delete?: UnidadEmpleadoraWhereUniqueInput | UnidadEmpleadoraWhereUniqueInput[]
    connect?: UnidadEmpleadoraWhereUniqueInput | UnidadEmpleadoraWhereUniqueInput[]
    update?: UnidadEmpleadoraUpdateWithWhereUniqueWithoutEmpresaEmpleadoraInput | UnidadEmpleadoraUpdateWithWhereUniqueWithoutEmpresaEmpleadoraInput[]
    updateMany?: UnidadEmpleadoraUpdateManyWithWhereWithoutEmpresaEmpleadoraInput | UnidadEmpleadoraUpdateManyWithWhereWithoutEmpresaEmpleadoraInput[]
    deleteMany?: UnidadEmpleadoraScalarWhereInput | UnidadEmpleadoraScalarWhereInput[]
  }

  export type ObjetivoUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput = {
    create?: XOR<ObjetivoCreateWithoutEmpresaEmpleadoraInput, ObjetivoUncheckedCreateWithoutEmpresaEmpleadoraInput> | ObjetivoCreateWithoutEmpresaEmpleadoraInput[] | ObjetivoUncheckedCreateWithoutEmpresaEmpleadoraInput[]
    connectOrCreate?: ObjetivoCreateOrConnectWithoutEmpresaEmpleadoraInput | ObjetivoCreateOrConnectWithoutEmpresaEmpleadoraInput[]
    upsert?: ObjetivoUpsertWithWhereUniqueWithoutEmpresaEmpleadoraInput | ObjetivoUpsertWithWhereUniqueWithoutEmpresaEmpleadoraInput[]
    createMany?: ObjetivoCreateManyEmpresaEmpleadoraInputEnvelope
    set?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    disconnect?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    delete?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    connect?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    update?: ObjetivoUpdateWithWhereUniqueWithoutEmpresaEmpleadoraInput | ObjetivoUpdateWithWhereUniqueWithoutEmpresaEmpleadoraInput[]
    updateMany?: ObjetivoUpdateManyWithWhereWithoutEmpresaEmpleadoraInput | ObjetivoUpdateManyWithWhereWithoutEmpresaEmpleadoraInput[]
    deleteMany?: ObjetivoScalarWhereInput | ObjetivoScalarWhereInput[]
  }

  export type EmpleadoUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput = {
    create?: XOR<EmpleadoCreateWithoutEmpresaEmpleadoraInput, EmpleadoUncheckedCreateWithoutEmpresaEmpleadoraInput> | EmpleadoCreateWithoutEmpresaEmpleadoraInput[] | EmpleadoUncheckedCreateWithoutEmpresaEmpleadoraInput[]
    connectOrCreate?: EmpleadoCreateOrConnectWithoutEmpresaEmpleadoraInput | EmpleadoCreateOrConnectWithoutEmpresaEmpleadoraInput[]
    upsert?: EmpleadoUpsertWithWhereUniqueWithoutEmpresaEmpleadoraInput | EmpleadoUpsertWithWhereUniqueWithoutEmpresaEmpleadoraInput[]
    createMany?: EmpleadoCreateManyEmpresaEmpleadoraInputEnvelope
    set?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    disconnect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    delete?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    connect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    update?: EmpleadoUpdateWithWhereUniqueWithoutEmpresaEmpleadoraInput | EmpleadoUpdateWithWhereUniqueWithoutEmpresaEmpleadoraInput[]
    updateMany?: EmpleadoUpdateManyWithWhereWithoutEmpresaEmpleadoraInput | EmpleadoUpdateManyWithWhereWithoutEmpresaEmpleadoraInput[]
    deleteMany?: EmpleadoScalarWhereInput | EmpleadoScalarWhereInput[]
  }

  export type EmpresaEmpleadoraCreateNestedOneWithoutEquipoEmpleadoraInput = {
    create?: XOR<EmpresaEmpleadoraCreateWithoutEquipoEmpleadoraInput, EmpresaEmpleadoraUncheckedCreateWithoutEquipoEmpleadoraInput>
    connectOrCreate?: EmpresaEmpleadoraCreateOrConnectWithoutEquipoEmpleadoraInput
    connect?: EmpresaEmpleadoraWhereUniqueInput
  }

  export type EmpleadoCreateNestedManyWithoutEquipoEmpleadoraInput = {
    create?: XOR<EmpleadoCreateWithoutEquipoEmpleadoraInput, EmpleadoUncheckedCreateWithoutEquipoEmpleadoraInput> | EmpleadoCreateWithoutEquipoEmpleadoraInput[] | EmpleadoUncheckedCreateWithoutEquipoEmpleadoraInput[]
    connectOrCreate?: EmpleadoCreateOrConnectWithoutEquipoEmpleadoraInput | EmpleadoCreateOrConnectWithoutEquipoEmpleadoraInput[]
    createMany?: EmpleadoCreateManyEquipoEmpleadoraInputEnvelope
    connect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
  }

  export type EmpleadoUncheckedCreateNestedManyWithoutEquipoEmpleadoraInput = {
    create?: XOR<EmpleadoCreateWithoutEquipoEmpleadoraInput, EmpleadoUncheckedCreateWithoutEquipoEmpleadoraInput> | EmpleadoCreateWithoutEquipoEmpleadoraInput[] | EmpleadoUncheckedCreateWithoutEquipoEmpleadoraInput[]
    connectOrCreate?: EmpleadoCreateOrConnectWithoutEquipoEmpleadoraInput | EmpleadoCreateOrConnectWithoutEquipoEmpleadoraInput[]
    createMany?: EmpleadoCreateManyEquipoEmpleadoraInputEnvelope
    connect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
  }

  export type EmpresaEmpleadoraUpdateOneRequiredWithoutEquipoEmpleadoraNestedInput = {
    create?: XOR<EmpresaEmpleadoraCreateWithoutEquipoEmpleadoraInput, EmpresaEmpleadoraUncheckedCreateWithoutEquipoEmpleadoraInput>
    connectOrCreate?: EmpresaEmpleadoraCreateOrConnectWithoutEquipoEmpleadoraInput
    upsert?: EmpresaEmpleadoraUpsertWithoutEquipoEmpleadoraInput
    connect?: EmpresaEmpleadoraWhereUniqueInput
    update?: XOR<XOR<EmpresaEmpleadoraUpdateToOneWithWhereWithoutEquipoEmpleadoraInput, EmpresaEmpleadoraUpdateWithoutEquipoEmpleadoraInput>, EmpresaEmpleadoraUncheckedUpdateWithoutEquipoEmpleadoraInput>
  }

  export type EmpleadoUpdateManyWithoutEquipoEmpleadoraNestedInput = {
    create?: XOR<EmpleadoCreateWithoutEquipoEmpleadoraInput, EmpleadoUncheckedCreateWithoutEquipoEmpleadoraInput> | EmpleadoCreateWithoutEquipoEmpleadoraInput[] | EmpleadoUncheckedCreateWithoutEquipoEmpleadoraInput[]
    connectOrCreate?: EmpleadoCreateOrConnectWithoutEquipoEmpleadoraInput | EmpleadoCreateOrConnectWithoutEquipoEmpleadoraInput[]
    upsert?: EmpleadoUpsertWithWhereUniqueWithoutEquipoEmpleadoraInput | EmpleadoUpsertWithWhereUniqueWithoutEquipoEmpleadoraInput[]
    createMany?: EmpleadoCreateManyEquipoEmpleadoraInputEnvelope
    set?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    disconnect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    delete?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    connect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    update?: EmpleadoUpdateWithWhereUniqueWithoutEquipoEmpleadoraInput | EmpleadoUpdateWithWhereUniqueWithoutEquipoEmpleadoraInput[]
    updateMany?: EmpleadoUpdateManyWithWhereWithoutEquipoEmpleadoraInput | EmpleadoUpdateManyWithWhereWithoutEquipoEmpleadoraInput[]
    deleteMany?: EmpleadoScalarWhereInput | EmpleadoScalarWhereInput[]
  }

  export type EmpleadoUncheckedUpdateManyWithoutEquipoEmpleadoraNestedInput = {
    create?: XOR<EmpleadoCreateWithoutEquipoEmpleadoraInput, EmpleadoUncheckedCreateWithoutEquipoEmpleadoraInput> | EmpleadoCreateWithoutEquipoEmpleadoraInput[] | EmpleadoUncheckedCreateWithoutEquipoEmpleadoraInput[]
    connectOrCreate?: EmpleadoCreateOrConnectWithoutEquipoEmpleadoraInput | EmpleadoCreateOrConnectWithoutEquipoEmpleadoraInput[]
    upsert?: EmpleadoUpsertWithWhereUniqueWithoutEquipoEmpleadoraInput | EmpleadoUpsertWithWhereUniqueWithoutEquipoEmpleadoraInput[]
    createMany?: EmpleadoCreateManyEquipoEmpleadoraInputEnvelope
    set?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    disconnect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    delete?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    connect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    update?: EmpleadoUpdateWithWhereUniqueWithoutEquipoEmpleadoraInput | EmpleadoUpdateWithWhereUniqueWithoutEquipoEmpleadoraInput[]
    updateMany?: EmpleadoUpdateManyWithWhereWithoutEquipoEmpleadoraInput | EmpleadoUpdateManyWithWhereWithoutEquipoEmpleadoraInput[]
    deleteMany?: EmpleadoScalarWhereInput | EmpleadoScalarWhereInput[]
  }

  export type EmpresaEmpleadoraCreateNestedOneWithoutPuestoEmpleadoraInput = {
    create?: XOR<EmpresaEmpleadoraCreateWithoutPuestoEmpleadoraInput, EmpresaEmpleadoraUncheckedCreateWithoutPuestoEmpleadoraInput>
    connectOrCreate?: EmpresaEmpleadoraCreateOrConnectWithoutPuestoEmpleadoraInput
    connect?: EmpresaEmpleadoraWhereUniqueInput
  }

  export type EmpleadoCreateNestedManyWithoutPuestoEmpleadoraInput = {
    create?: XOR<EmpleadoCreateWithoutPuestoEmpleadoraInput, EmpleadoUncheckedCreateWithoutPuestoEmpleadoraInput> | EmpleadoCreateWithoutPuestoEmpleadoraInput[] | EmpleadoUncheckedCreateWithoutPuestoEmpleadoraInput[]
    connectOrCreate?: EmpleadoCreateOrConnectWithoutPuestoEmpleadoraInput | EmpleadoCreateOrConnectWithoutPuestoEmpleadoraInput[]
    createMany?: EmpleadoCreateManyPuestoEmpleadoraInputEnvelope
    connect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
  }

  export type EmpleadoUncheckedCreateNestedManyWithoutPuestoEmpleadoraInput = {
    create?: XOR<EmpleadoCreateWithoutPuestoEmpleadoraInput, EmpleadoUncheckedCreateWithoutPuestoEmpleadoraInput> | EmpleadoCreateWithoutPuestoEmpleadoraInput[] | EmpleadoUncheckedCreateWithoutPuestoEmpleadoraInput[]
    connectOrCreate?: EmpleadoCreateOrConnectWithoutPuestoEmpleadoraInput | EmpleadoCreateOrConnectWithoutPuestoEmpleadoraInput[]
    createMany?: EmpleadoCreateManyPuestoEmpleadoraInputEnvelope
    connect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
  }

  export type EmpresaEmpleadoraUpdateOneRequiredWithoutPuestoEmpleadoraNestedInput = {
    create?: XOR<EmpresaEmpleadoraCreateWithoutPuestoEmpleadoraInput, EmpresaEmpleadoraUncheckedCreateWithoutPuestoEmpleadoraInput>
    connectOrCreate?: EmpresaEmpleadoraCreateOrConnectWithoutPuestoEmpleadoraInput
    upsert?: EmpresaEmpleadoraUpsertWithoutPuestoEmpleadoraInput
    connect?: EmpresaEmpleadoraWhereUniqueInput
    update?: XOR<XOR<EmpresaEmpleadoraUpdateToOneWithWhereWithoutPuestoEmpleadoraInput, EmpresaEmpleadoraUpdateWithoutPuestoEmpleadoraInput>, EmpresaEmpleadoraUncheckedUpdateWithoutPuestoEmpleadoraInput>
  }

  export type EmpleadoUpdateManyWithoutPuestoEmpleadoraNestedInput = {
    create?: XOR<EmpleadoCreateWithoutPuestoEmpleadoraInput, EmpleadoUncheckedCreateWithoutPuestoEmpleadoraInput> | EmpleadoCreateWithoutPuestoEmpleadoraInput[] | EmpleadoUncheckedCreateWithoutPuestoEmpleadoraInput[]
    connectOrCreate?: EmpleadoCreateOrConnectWithoutPuestoEmpleadoraInput | EmpleadoCreateOrConnectWithoutPuestoEmpleadoraInput[]
    upsert?: EmpleadoUpsertWithWhereUniqueWithoutPuestoEmpleadoraInput | EmpleadoUpsertWithWhereUniqueWithoutPuestoEmpleadoraInput[]
    createMany?: EmpleadoCreateManyPuestoEmpleadoraInputEnvelope
    set?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    disconnect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    delete?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    connect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    update?: EmpleadoUpdateWithWhereUniqueWithoutPuestoEmpleadoraInput | EmpleadoUpdateWithWhereUniqueWithoutPuestoEmpleadoraInput[]
    updateMany?: EmpleadoUpdateManyWithWhereWithoutPuestoEmpleadoraInput | EmpleadoUpdateManyWithWhereWithoutPuestoEmpleadoraInput[]
    deleteMany?: EmpleadoScalarWhereInput | EmpleadoScalarWhereInput[]
  }

  export type EmpleadoUncheckedUpdateManyWithoutPuestoEmpleadoraNestedInput = {
    create?: XOR<EmpleadoCreateWithoutPuestoEmpleadoraInput, EmpleadoUncheckedCreateWithoutPuestoEmpleadoraInput> | EmpleadoCreateWithoutPuestoEmpleadoraInput[] | EmpleadoUncheckedCreateWithoutPuestoEmpleadoraInput[]
    connectOrCreate?: EmpleadoCreateOrConnectWithoutPuestoEmpleadoraInput | EmpleadoCreateOrConnectWithoutPuestoEmpleadoraInput[]
    upsert?: EmpleadoUpsertWithWhereUniqueWithoutPuestoEmpleadoraInput | EmpleadoUpsertWithWhereUniqueWithoutPuestoEmpleadoraInput[]
    createMany?: EmpleadoCreateManyPuestoEmpleadoraInputEnvelope
    set?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    disconnect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    delete?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    connect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    update?: EmpleadoUpdateWithWhereUniqueWithoutPuestoEmpleadoraInput | EmpleadoUpdateWithWhereUniqueWithoutPuestoEmpleadoraInput[]
    updateMany?: EmpleadoUpdateManyWithWhereWithoutPuestoEmpleadoraInput | EmpleadoUpdateManyWithWhereWithoutPuestoEmpleadoraInput[]
    deleteMany?: EmpleadoScalarWhereInput | EmpleadoScalarWhereInput[]
  }

  export type EmpresaEmpleadoraCreateNestedOneWithoutUnidadEmpleadoraInput = {
    create?: XOR<EmpresaEmpleadoraCreateWithoutUnidadEmpleadoraInput, EmpresaEmpleadoraUncheckedCreateWithoutUnidadEmpleadoraInput>
    connectOrCreate?: EmpresaEmpleadoraCreateOrConnectWithoutUnidadEmpleadoraInput
    connect?: EmpresaEmpleadoraWhereUniqueInput
  }

  export type EmpleadoCreateNestedManyWithoutUnidadEmpleadoraInput = {
    create?: XOR<EmpleadoCreateWithoutUnidadEmpleadoraInput, EmpleadoUncheckedCreateWithoutUnidadEmpleadoraInput> | EmpleadoCreateWithoutUnidadEmpleadoraInput[] | EmpleadoUncheckedCreateWithoutUnidadEmpleadoraInput[]
    connectOrCreate?: EmpleadoCreateOrConnectWithoutUnidadEmpleadoraInput | EmpleadoCreateOrConnectWithoutUnidadEmpleadoraInput[]
    createMany?: EmpleadoCreateManyUnidadEmpleadoraInputEnvelope
    connect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
  }

  export type EmpleadoUncheckedCreateNestedManyWithoutUnidadEmpleadoraInput = {
    create?: XOR<EmpleadoCreateWithoutUnidadEmpleadoraInput, EmpleadoUncheckedCreateWithoutUnidadEmpleadoraInput> | EmpleadoCreateWithoutUnidadEmpleadoraInput[] | EmpleadoUncheckedCreateWithoutUnidadEmpleadoraInput[]
    connectOrCreate?: EmpleadoCreateOrConnectWithoutUnidadEmpleadoraInput | EmpleadoCreateOrConnectWithoutUnidadEmpleadoraInput[]
    createMany?: EmpleadoCreateManyUnidadEmpleadoraInputEnvelope
    connect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
  }

  export type EmpresaEmpleadoraUpdateOneRequiredWithoutUnidadEmpleadoraNestedInput = {
    create?: XOR<EmpresaEmpleadoraCreateWithoutUnidadEmpleadoraInput, EmpresaEmpleadoraUncheckedCreateWithoutUnidadEmpleadoraInput>
    connectOrCreate?: EmpresaEmpleadoraCreateOrConnectWithoutUnidadEmpleadoraInput
    upsert?: EmpresaEmpleadoraUpsertWithoutUnidadEmpleadoraInput
    connect?: EmpresaEmpleadoraWhereUniqueInput
    update?: XOR<XOR<EmpresaEmpleadoraUpdateToOneWithWhereWithoutUnidadEmpleadoraInput, EmpresaEmpleadoraUpdateWithoutUnidadEmpleadoraInput>, EmpresaEmpleadoraUncheckedUpdateWithoutUnidadEmpleadoraInput>
  }

  export type EmpleadoUpdateManyWithoutUnidadEmpleadoraNestedInput = {
    create?: XOR<EmpleadoCreateWithoutUnidadEmpleadoraInput, EmpleadoUncheckedCreateWithoutUnidadEmpleadoraInput> | EmpleadoCreateWithoutUnidadEmpleadoraInput[] | EmpleadoUncheckedCreateWithoutUnidadEmpleadoraInput[]
    connectOrCreate?: EmpleadoCreateOrConnectWithoutUnidadEmpleadoraInput | EmpleadoCreateOrConnectWithoutUnidadEmpleadoraInput[]
    upsert?: EmpleadoUpsertWithWhereUniqueWithoutUnidadEmpleadoraInput | EmpleadoUpsertWithWhereUniqueWithoutUnidadEmpleadoraInput[]
    createMany?: EmpleadoCreateManyUnidadEmpleadoraInputEnvelope
    set?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    disconnect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    delete?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    connect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    update?: EmpleadoUpdateWithWhereUniqueWithoutUnidadEmpleadoraInput | EmpleadoUpdateWithWhereUniqueWithoutUnidadEmpleadoraInput[]
    updateMany?: EmpleadoUpdateManyWithWhereWithoutUnidadEmpleadoraInput | EmpleadoUpdateManyWithWhereWithoutUnidadEmpleadoraInput[]
    deleteMany?: EmpleadoScalarWhereInput | EmpleadoScalarWhereInput[]
  }

  export type EmpleadoUncheckedUpdateManyWithoutUnidadEmpleadoraNestedInput = {
    create?: XOR<EmpleadoCreateWithoutUnidadEmpleadoraInput, EmpleadoUncheckedCreateWithoutUnidadEmpleadoraInput> | EmpleadoCreateWithoutUnidadEmpleadoraInput[] | EmpleadoUncheckedCreateWithoutUnidadEmpleadoraInput[]
    connectOrCreate?: EmpleadoCreateOrConnectWithoutUnidadEmpleadoraInput | EmpleadoCreateOrConnectWithoutUnidadEmpleadoraInput[]
    upsert?: EmpleadoUpsertWithWhereUniqueWithoutUnidadEmpleadoraInput | EmpleadoUpsertWithWhereUniqueWithoutUnidadEmpleadoraInput[]
    createMany?: EmpleadoCreateManyUnidadEmpleadoraInputEnvelope
    set?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    disconnect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    delete?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    connect?: EmpleadoWhereUniqueInput | EmpleadoWhereUniqueInput[]
    update?: EmpleadoUpdateWithWhereUniqueWithoutUnidadEmpleadoraInput | EmpleadoUpdateWithWhereUniqueWithoutUnidadEmpleadoraInput[]
    updateMany?: EmpleadoUpdateManyWithWhereWithoutUnidadEmpleadoraInput | EmpleadoUpdateManyWithWhereWithoutUnidadEmpleadoraInput[]
    deleteMany?: EmpleadoScalarWhereInput | EmpleadoScalarWhereInput[]
  }

  export type EmpresaEmpleadoraCreateNestedOneWithoutObjetivoInput = {
    create?: XOR<EmpresaEmpleadoraCreateWithoutObjetivoInput, EmpresaEmpleadoraUncheckedCreateWithoutObjetivoInput>
    connectOrCreate?: EmpresaEmpleadoraCreateOrConnectWithoutObjetivoInput
    connect?: EmpresaEmpleadoraWhereUniqueInput
  }

  export type EmpleadoCreateNestedOneWithoutObjetivoInput = {
    create?: XOR<EmpleadoCreateWithoutObjetivoInput, EmpleadoUncheckedCreateWithoutObjetivoInput>
    connectOrCreate?: EmpleadoCreateOrConnectWithoutObjetivoInput
    connect?: EmpleadoWhereUniqueInput
  }

  export type ObjetivoDetalleCreateNestedManyWithoutObjetivoInput = {
    create?: XOR<ObjetivoDetalleCreateWithoutObjetivoInput, ObjetivoDetalleUncheckedCreateWithoutObjetivoInput> | ObjetivoDetalleCreateWithoutObjetivoInput[] | ObjetivoDetalleUncheckedCreateWithoutObjetivoInput[]
    connectOrCreate?: ObjetivoDetalleCreateOrConnectWithoutObjetivoInput | ObjetivoDetalleCreateOrConnectWithoutObjetivoInput[]
    createMany?: ObjetivoDetalleCreateManyObjetivoInputEnvelope
    connect?: ObjetivoDetalleWhereUniqueInput | ObjetivoDetalleWhereUniqueInput[]
  }

  export type ObjetivoDetalleUncheckedCreateNestedManyWithoutObjetivoInput = {
    create?: XOR<ObjetivoDetalleCreateWithoutObjetivoInput, ObjetivoDetalleUncheckedCreateWithoutObjetivoInput> | ObjetivoDetalleCreateWithoutObjetivoInput[] | ObjetivoDetalleUncheckedCreateWithoutObjetivoInput[]
    connectOrCreate?: ObjetivoDetalleCreateOrConnectWithoutObjetivoInput | ObjetivoDetalleCreateOrConnectWithoutObjetivoInput[]
    createMany?: ObjetivoDetalleCreateManyObjetivoInputEnvelope
    connect?: ObjetivoDetalleWhereUniqueInput | ObjetivoDetalleWhereUniqueInput[]
  }

  export type EmpresaEmpleadoraUpdateOneRequiredWithoutObjetivoNestedInput = {
    create?: XOR<EmpresaEmpleadoraCreateWithoutObjetivoInput, EmpresaEmpleadoraUncheckedCreateWithoutObjetivoInput>
    connectOrCreate?: EmpresaEmpleadoraCreateOrConnectWithoutObjetivoInput
    upsert?: EmpresaEmpleadoraUpsertWithoutObjetivoInput
    connect?: EmpresaEmpleadoraWhereUniqueInput
    update?: XOR<XOR<EmpresaEmpleadoraUpdateToOneWithWhereWithoutObjetivoInput, EmpresaEmpleadoraUpdateWithoutObjetivoInput>, EmpresaEmpleadoraUncheckedUpdateWithoutObjetivoInput>
  }

  export type EmpleadoUpdateOneRequiredWithoutObjetivoNestedInput = {
    create?: XOR<EmpleadoCreateWithoutObjetivoInput, EmpleadoUncheckedCreateWithoutObjetivoInput>
    connectOrCreate?: EmpleadoCreateOrConnectWithoutObjetivoInput
    upsert?: EmpleadoUpsertWithoutObjetivoInput
    connect?: EmpleadoWhereUniqueInput
    update?: XOR<XOR<EmpleadoUpdateToOneWithWhereWithoutObjetivoInput, EmpleadoUpdateWithoutObjetivoInput>, EmpleadoUncheckedUpdateWithoutObjetivoInput>
  }

  export type ObjetivoDetalleUpdateManyWithoutObjetivoNestedInput = {
    create?: XOR<ObjetivoDetalleCreateWithoutObjetivoInput, ObjetivoDetalleUncheckedCreateWithoutObjetivoInput> | ObjetivoDetalleCreateWithoutObjetivoInput[] | ObjetivoDetalleUncheckedCreateWithoutObjetivoInput[]
    connectOrCreate?: ObjetivoDetalleCreateOrConnectWithoutObjetivoInput | ObjetivoDetalleCreateOrConnectWithoutObjetivoInput[]
    upsert?: ObjetivoDetalleUpsertWithWhereUniqueWithoutObjetivoInput | ObjetivoDetalleUpsertWithWhereUniqueWithoutObjetivoInput[]
    createMany?: ObjetivoDetalleCreateManyObjetivoInputEnvelope
    set?: ObjetivoDetalleWhereUniqueInput | ObjetivoDetalleWhereUniqueInput[]
    disconnect?: ObjetivoDetalleWhereUniqueInput | ObjetivoDetalleWhereUniqueInput[]
    delete?: ObjetivoDetalleWhereUniqueInput | ObjetivoDetalleWhereUniqueInput[]
    connect?: ObjetivoDetalleWhereUniqueInput | ObjetivoDetalleWhereUniqueInput[]
    update?: ObjetivoDetalleUpdateWithWhereUniqueWithoutObjetivoInput | ObjetivoDetalleUpdateWithWhereUniqueWithoutObjetivoInput[]
    updateMany?: ObjetivoDetalleUpdateManyWithWhereWithoutObjetivoInput | ObjetivoDetalleUpdateManyWithWhereWithoutObjetivoInput[]
    deleteMany?: ObjetivoDetalleScalarWhereInput | ObjetivoDetalleScalarWhereInput[]
  }

  export type ObjetivoDetalleUncheckedUpdateManyWithoutObjetivoNestedInput = {
    create?: XOR<ObjetivoDetalleCreateWithoutObjetivoInput, ObjetivoDetalleUncheckedCreateWithoutObjetivoInput> | ObjetivoDetalleCreateWithoutObjetivoInput[] | ObjetivoDetalleUncheckedCreateWithoutObjetivoInput[]
    connectOrCreate?: ObjetivoDetalleCreateOrConnectWithoutObjetivoInput | ObjetivoDetalleCreateOrConnectWithoutObjetivoInput[]
    upsert?: ObjetivoDetalleUpsertWithWhereUniqueWithoutObjetivoInput | ObjetivoDetalleUpsertWithWhereUniqueWithoutObjetivoInput[]
    createMany?: ObjetivoDetalleCreateManyObjetivoInputEnvelope
    set?: ObjetivoDetalleWhereUniqueInput | ObjetivoDetalleWhereUniqueInput[]
    disconnect?: ObjetivoDetalleWhereUniqueInput | ObjetivoDetalleWhereUniqueInput[]
    delete?: ObjetivoDetalleWhereUniqueInput | ObjetivoDetalleWhereUniqueInput[]
    connect?: ObjetivoDetalleWhereUniqueInput | ObjetivoDetalleWhereUniqueInput[]
    update?: ObjetivoDetalleUpdateWithWhereUniqueWithoutObjetivoInput | ObjetivoDetalleUpdateWithWhereUniqueWithoutObjetivoInput[]
    updateMany?: ObjetivoDetalleUpdateManyWithWhereWithoutObjetivoInput | ObjetivoDetalleUpdateManyWithWhereWithoutObjetivoInput[]
    deleteMany?: ObjetivoDetalleScalarWhereInput | ObjetivoDetalleScalarWhereInput[]
  }

  export type ObjetivoCreateNestedOneWithoutObjetivoDetalleInput = {
    create?: XOR<ObjetivoCreateWithoutObjetivoDetalleInput, ObjetivoUncheckedCreateWithoutObjetivoDetalleInput>
    connectOrCreate?: ObjetivoCreateOrConnectWithoutObjetivoDetalleInput
    connect?: ObjetivoWhereUniqueInput
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ObjetivoUpdateOneRequiredWithoutObjetivoDetalleNestedInput = {
    create?: XOR<ObjetivoCreateWithoutObjetivoDetalleInput, ObjetivoUncheckedCreateWithoutObjetivoDetalleInput>
    connectOrCreate?: ObjetivoCreateOrConnectWithoutObjetivoDetalleInput
    upsert?: ObjetivoUpsertWithoutObjetivoDetalleInput
    connect?: ObjetivoWhereUniqueInput
    update?: XOR<XOR<ObjetivoUpdateToOneWithWhereWithoutObjetivoDetalleInput, ObjetivoUpdateWithoutObjetivoDetalleInput>, ObjetivoUncheckedUpdateWithoutObjetivoDetalleInput>
  }

  export type TablaMaestraDetalleCreateNestedManyWithoutTablaMaestraInput = {
    create?: XOR<TablaMaestraDetalleCreateWithoutTablaMaestraInput, TablaMaestraDetalleUncheckedCreateWithoutTablaMaestraInput> | TablaMaestraDetalleCreateWithoutTablaMaestraInput[] | TablaMaestraDetalleUncheckedCreateWithoutTablaMaestraInput[]
    connectOrCreate?: TablaMaestraDetalleCreateOrConnectWithoutTablaMaestraInput | TablaMaestraDetalleCreateOrConnectWithoutTablaMaestraInput[]
    createMany?: TablaMaestraDetalleCreateManyTablaMaestraInputEnvelope
    connect?: TablaMaestraDetalleWhereUniqueInput | TablaMaestraDetalleWhereUniqueInput[]
  }

  export type TablaMaestraDetalleUncheckedCreateNestedManyWithoutTablaMaestraInput = {
    create?: XOR<TablaMaestraDetalleCreateWithoutTablaMaestraInput, TablaMaestraDetalleUncheckedCreateWithoutTablaMaestraInput> | TablaMaestraDetalleCreateWithoutTablaMaestraInput[] | TablaMaestraDetalleUncheckedCreateWithoutTablaMaestraInput[]
    connectOrCreate?: TablaMaestraDetalleCreateOrConnectWithoutTablaMaestraInput | TablaMaestraDetalleCreateOrConnectWithoutTablaMaestraInput[]
    createMany?: TablaMaestraDetalleCreateManyTablaMaestraInputEnvelope
    connect?: TablaMaestraDetalleWhereUniqueInput | TablaMaestraDetalleWhereUniqueInput[]
  }

  export type TablaMaestraDetalleUpdateManyWithoutTablaMaestraNestedInput = {
    create?: XOR<TablaMaestraDetalleCreateWithoutTablaMaestraInput, TablaMaestraDetalleUncheckedCreateWithoutTablaMaestraInput> | TablaMaestraDetalleCreateWithoutTablaMaestraInput[] | TablaMaestraDetalleUncheckedCreateWithoutTablaMaestraInput[]
    connectOrCreate?: TablaMaestraDetalleCreateOrConnectWithoutTablaMaestraInput | TablaMaestraDetalleCreateOrConnectWithoutTablaMaestraInput[]
    upsert?: TablaMaestraDetalleUpsertWithWhereUniqueWithoutTablaMaestraInput | TablaMaestraDetalleUpsertWithWhereUniqueWithoutTablaMaestraInput[]
    createMany?: TablaMaestraDetalleCreateManyTablaMaestraInputEnvelope
    set?: TablaMaestraDetalleWhereUniqueInput | TablaMaestraDetalleWhereUniqueInput[]
    disconnect?: TablaMaestraDetalleWhereUniqueInput | TablaMaestraDetalleWhereUniqueInput[]
    delete?: TablaMaestraDetalleWhereUniqueInput | TablaMaestraDetalleWhereUniqueInput[]
    connect?: TablaMaestraDetalleWhereUniqueInput | TablaMaestraDetalleWhereUniqueInput[]
    update?: TablaMaestraDetalleUpdateWithWhereUniqueWithoutTablaMaestraInput | TablaMaestraDetalleUpdateWithWhereUniqueWithoutTablaMaestraInput[]
    updateMany?: TablaMaestraDetalleUpdateManyWithWhereWithoutTablaMaestraInput | TablaMaestraDetalleUpdateManyWithWhereWithoutTablaMaestraInput[]
    deleteMany?: TablaMaestraDetalleScalarWhereInput | TablaMaestraDetalleScalarWhereInput[]
  }

  export type TablaMaestraDetalleUncheckedUpdateManyWithoutTablaMaestraNestedInput = {
    create?: XOR<TablaMaestraDetalleCreateWithoutTablaMaestraInput, TablaMaestraDetalleUncheckedCreateWithoutTablaMaestraInput> | TablaMaestraDetalleCreateWithoutTablaMaestraInput[] | TablaMaestraDetalleUncheckedCreateWithoutTablaMaestraInput[]
    connectOrCreate?: TablaMaestraDetalleCreateOrConnectWithoutTablaMaestraInput | TablaMaestraDetalleCreateOrConnectWithoutTablaMaestraInput[]
    upsert?: TablaMaestraDetalleUpsertWithWhereUniqueWithoutTablaMaestraInput | TablaMaestraDetalleUpsertWithWhereUniqueWithoutTablaMaestraInput[]
    createMany?: TablaMaestraDetalleCreateManyTablaMaestraInputEnvelope
    set?: TablaMaestraDetalleWhereUniqueInput | TablaMaestraDetalleWhereUniqueInput[]
    disconnect?: TablaMaestraDetalleWhereUniqueInput | TablaMaestraDetalleWhereUniqueInput[]
    delete?: TablaMaestraDetalleWhereUniqueInput | TablaMaestraDetalleWhereUniqueInput[]
    connect?: TablaMaestraDetalleWhereUniqueInput | TablaMaestraDetalleWhereUniqueInput[]
    update?: TablaMaestraDetalleUpdateWithWhereUniqueWithoutTablaMaestraInput | TablaMaestraDetalleUpdateWithWhereUniqueWithoutTablaMaestraInput[]
    updateMany?: TablaMaestraDetalleUpdateManyWithWhereWithoutTablaMaestraInput | TablaMaestraDetalleUpdateManyWithWhereWithoutTablaMaestraInput[]
    deleteMany?: TablaMaestraDetalleScalarWhereInput | TablaMaestraDetalleScalarWhereInput[]
  }

  export type TablaMaestraCreateNestedOneWithoutTablaMaestraDetalleInput = {
    create?: XOR<TablaMaestraCreateWithoutTablaMaestraDetalleInput, TablaMaestraUncheckedCreateWithoutTablaMaestraDetalleInput>
    connectOrCreate?: TablaMaestraCreateOrConnectWithoutTablaMaestraDetalleInput
    connect?: TablaMaestraWhereUniqueInput
  }

  export type TablaMaestraUpdateOneRequiredWithoutTablaMaestraDetalleNestedInput = {
    create?: XOR<TablaMaestraCreateWithoutTablaMaestraDetalleInput, TablaMaestraUncheckedCreateWithoutTablaMaestraDetalleInput>
    connectOrCreate?: TablaMaestraCreateOrConnectWithoutTablaMaestraDetalleInput
    upsert?: TablaMaestraUpsertWithoutTablaMaestraDetalleInput
    connect?: TablaMaestraWhereUniqueInput
    update?: XOR<XOR<TablaMaestraUpdateToOneWithWhereWithoutTablaMaestraDetalleInput, TablaMaestraUpdateWithoutTablaMaestraDetalleInput>, TablaMaestraUncheckedUpdateWithoutTablaMaestraDetalleInput>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumRolFilter<$PrismaModel = never> = {
    equals?: $Enums.Rol | EnumRolFieldRefInput<$PrismaModel>
    in?: $Enums.Rol[] | ListEnumRolFieldRefInput<$PrismaModel>
    notIn?: $Enums.Rol[] | ListEnumRolFieldRefInput<$PrismaModel>
    not?: NestedEnumRolFilter<$PrismaModel> | $Enums.Rol
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedEnumRolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Rol | EnumRolFieldRefInput<$PrismaModel>
    in?: $Enums.Rol[] | ListEnumRolFieldRefInput<$PrismaModel>
    notIn?: $Enums.Rol[] | ListEnumRolFieldRefInput<$PrismaModel>
    not?: NestedEnumRolWithAggregatesFilter<$PrismaModel> | $Enums.Rol
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRolFilter<$PrismaModel>
    _max?: NestedEnumRolFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type EmpresaEmpleadoraCreateWithoutEmpleadoInput = {
    nombreEmpresa: string
    ruc?: string | null
    direccionEmpresa?: string | null
    urlLogo: string
    fechaVigenciaInicio: Date | string
    fechaVigenciaFin: Date | string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    equipoEmpleadora?: EquipoEmpleadoraCreateNestedManyWithoutEmpresaEmpleadoraInput
    puestoEmpleadora?: PuestoEmpleadoraCreateNestedManyWithoutEmpresaEmpleadoraInput
    unidadEmpleadora?: UnidadEmpleadoraCreateNestedManyWithoutEmpresaEmpleadoraInput
    objetivo?: ObjetivoCreateNestedManyWithoutEmpresaEmpleadoraInput
  }

  export type EmpresaEmpleadoraUncheckedCreateWithoutEmpleadoInput = {
    idEmpresaEmpleadora?: number
    nombreEmpresa: string
    ruc?: string | null
    direccionEmpresa?: string | null
    urlLogo: string
    fechaVigenciaInicio: Date | string
    fechaVigenciaFin: Date | string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    equipoEmpleadora?: EquipoEmpleadoraUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput
    puestoEmpleadora?: PuestoEmpleadoraUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput
    unidadEmpleadora?: UnidadEmpleadoraUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput
    objetivo?: ObjetivoUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput
  }

  export type EmpresaEmpleadoraCreateOrConnectWithoutEmpleadoInput = {
    where: EmpresaEmpleadoraWhereUniqueInput
    create: XOR<EmpresaEmpleadoraCreateWithoutEmpleadoInput, EmpresaEmpleadoraUncheckedCreateWithoutEmpleadoInput>
  }

  export type EquipoEmpleadoraCreateWithoutEmpleadoInput = {
    descripcion: string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    empresaEmpleadora: EmpresaEmpleadoraCreateNestedOneWithoutEquipoEmpleadoraInput
  }

  export type EquipoEmpleadoraUncheckedCreateWithoutEmpleadoInput = {
    idEquipoEmpleadora?: number
    descripcion: string
    idEmpresaEmpleadora: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type EquipoEmpleadoraCreateOrConnectWithoutEmpleadoInput = {
    where: EquipoEmpleadoraWhereUniqueInput
    create: XOR<EquipoEmpleadoraCreateWithoutEmpleadoInput, EquipoEmpleadoraUncheckedCreateWithoutEmpleadoInput>
  }

  export type PuestoEmpleadoraCreateWithoutEmpleadoInput = {
    descripcion: string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    empresaEmpleadora: EmpresaEmpleadoraCreateNestedOneWithoutPuestoEmpleadoraInput
  }

  export type PuestoEmpleadoraUncheckedCreateWithoutEmpleadoInput = {
    idPuestoEmpleadora?: number
    descripcion: string
    idEmpresaEmpleadora: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type PuestoEmpleadoraCreateOrConnectWithoutEmpleadoInput = {
    where: PuestoEmpleadoraWhereUniqueInput
    create: XOR<PuestoEmpleadoraCreateWithoutEmpleadoInput, PuestoEmpleadoraUncheckedCreateWithoutEmpleadoInput>
  }

  export type UnidadEmpleadoraCreateWithoutEmpleadoInput = {
    descripcion: string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    empresaEmpleadora: EmpresaEmpleadoraCreateNestedOneWithoutUnidadEmpleadoraInput
  }

  export type UnidadEmpleadoraUncheckedCreateWithoutEmpleadoInput = {
    idUnidadEmpleadora?: number
    descripcion: string
    idEmpresaEmpleadora: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type UnidadEmpleadoraCreateOrConnectWithoutEmpleadoInput = {
    where: UnidadEmpleadoraWhereUniqueInput
    create: XOR<UnidadEmpleadoraCreateWithoutEmpleadoInput, UnidadEmpleadoraUncheckedCreateWithoutEmpleadoInput>
  }

  export type UsuarioCreateWithoutEmpleadoInput = {
    codigoUsuario: string
    correoElectronico?: string | null
    contrasena: string
    rol?: $Enums.Rol
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type UsuarioUncheckedCreateWithoutEmpleadoInput = {
    idUsuario?: number
    codigoUsuario: string
    correoElectronico?: string | null
    contrasena: string
    rol?: $Enums.Rol
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type UsuarioCreateOrConnectWithoutEmpleadoInput = {
    where: UsuarioWhereUniqueInput
    create: XOR<UsuarioCreateWithoutEmpleadoInput, UsuarioUncheckedCreateWithoutEmpleadoInput>
  }

  export type ObjetivoCreateWithoutEmpleadoInput = {
    fechaVigenciaInicia: Date | string
    fechaVigenciaFin: Date | string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    empresaEmpleadora: EmpresaEmpleadoraCreateNestedOneWithoutObjetivoInput
    ObjetivoDetalle?: ObjetivoDetalleCreateNestedManyWithoutObjetivoInput
  }

  export type ObjetivoUncheckedCreateWithoutEmpleadoInput = {
    idObjetivo?: number
    fechaVigenciaInicia: Date | string
    fechaVigenciaFin: Date | string
    idEmpresaEmpleadora: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    ObjetivoDetalle?: ObjetivoDetalleUncheckedCreateNestedManyWithoutObjetivoInput
  }

  export type ObjetivoCreateOrConnectWithoutEmpleadoInput = {
    where: ObjetivoWhereUniqueInput
    create: XOR<ObjetivoCreateWithoutEmpleadoInput, ObjetivoUncheckedCreateWithoutEmpleadoInput>
  }

  export type ObjetivoCreateManyEmpleadoInputEnvelope = {
    data: ObjetivoCreateManyEmpleadoInput | ObjetivoCreateManyEmpleadoInput[]
    skipDuplicates?: boolean
  }

  export type EmpresaEmpleadoraUpsertWithoutEmpleadoInput = {
    update: XOR<EmpresaEmpleadoraUpdateWithoutEmpleadoInput, EmpresaEmpleadoraUncheckedUpdateWithoutEmpleadoInput>
    create: XOR<EmpresaEmpleadoraCreateWithoutEmpleadoInput, EmpresaEmpleadoraUncheckedCreateWithoutEmpleadoInput>
    where?: EmpresaEmpleadoraWhereInput
  }

  export type EmpresaEmpleadoraUpdateToOneWithWhereWithoutEmpleadoInput = {
    where?: EmpresaEmpleadoraWhereInput
    data: XOR<EmpresaEmpleadoraUpdateWithoutEmpleadoInput, EmpresaEmpleadoraUncheckedUpdateWithoutEmpleadoInput>
  }

  export type EmpresaEmpleadoraUpdateWithoutEmpleadoInput = {
    nombreEmpresa?: StringFieldUpdateOperationsInput | string
    ruc?: NullableStringFieldUpdateOperationsInput | string | null
    direccionEmpresa?: NullableStringFieldUpdateOperationsInput | string | null
    urlLogo?: StringFieldUpdateOperationsInput | string
    fechaVigenciaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVigenciaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    equipoEmpleadora?: EquipoEmpleadoraUpdateManyWithoutEmpresaEmpleadoraNestedInput
    puestoEmpleadora?: PuestoEmpleadoraUpdateManyWithoutEmpresaEmpleadoraNestedInput
    unidadEmpleadora?: UnidadEmpleadoraUpdateManyWithoutEmpresaEmpleadoraNestedInput
    objetivo?: ObjetivoUpdateManyWithoutEmpresaEmpleadoraNestedInput
  }

  export type EmpresaEmpleadoraUncheckedUpdateWithoutEmpleadoInput = {
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    nombreEmpresa?: StringFieldUpdateOperationsInput | string
    ruc?: NullableStringFieldUpdateOperationsInput | string | null
    direccionEmpresa?: NullableStringFieldUpdateOperationsInput | string | null
    urlLogo?: StringFieldUpdateOperationsInput | string
    fechaVigenciaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVigenciaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    equipoEmpleadora?: EquipoEmpleadoraUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput
    puestoEmpleadora?: PuestoEmpleadoraUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput
    unidadEmpleadora?: UnidadEmpleadoraUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput
    objetivo?: ObjetivoUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput
  }

  export type EquipoEmpleadoraUpsertWithoutEmpleadoInput = {
    update: XOR<EquipoEmpleadoraUpdateWithoutEmpleadoInput, EquipoEmpleadoraUncheckedUpdateWithoutEmpleadoInput>
    create: XOR<EquipoEmpleadoraCreateWithoutEmpleadoInput, EquipoEmpleadoraUncheckedCreateWithoutEmpleadoInput>
    where?: EquipoEmpleadoraWhereInput
  }

  export type EquipoEmpleadoraUpdateToOneWithWhereWithoutEmpleadoInput = {
    where?: EquipoEmpleadoraWhereInput
    data: XOR<EquipoEmpleadoraUpdateWithoutEmpleadoInput, EquipoEmpleadoraUncheckedUpdateWithoutEmpleadoInput>
  }

  export type EquipoEmpleadoraUpdateWithoutEmpleadoInput = {
    descripcion?: StringFieldUpdateOperationsInput | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    empresaEmpleadora?: EmpresaEmpleadoraUpdateOneRequiredWithoutEquipoEmpleadoraNestedInput
  }

  export type EquipoEmpleadoraUncheckedUpdateWithoutEmpleadoInput = {
    idEquipoEmpleadora?: IntFieldUpdateOperationsInput | number
    descripcion?: StringFieldUpdateOperationsInput | string
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PuestoEmpleadoraUpsertWithoutEmpleadoInput = {
    update: XOR<PuestoEmpleadoraUpdateWithoutEmpleadoInput, PuestoEmpleadoraUncheckedUpdateWithoutEmpleadoInput>
    create: XOR<PuestoEmpleadoraCreateWithoutEmpleadoInput, PuestoEmpleadoraUncheckedCreateWithoutEmpleadoInput>
    where?: PuestoEmpleadoraWhereInput
  }

  export type PuestoEmpleadoraUpdateToOneWithWhereWithoutEmpleadoInput = {
    where?: PuestoEmpleadoraWhereInput
    data: XOR<PuestoEmpleadoraUpdateWithoutEmpleadoInput, PuestoEmpleadoraUncheckedUpdateWithoutEmpleadoInput>
  }

  export type PuestoEmpleadoraUpdateWithoutEmpleadoInput = {
    descripcion?: StringFieldUpdateOperationsInput | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    empresaEmpleadora?: EmpresaEmpleadoraUpdateOneRequiredWithoutPuestoEmpleadoraNestedInput
  }

  export type PuestoEmpleadoraUncheckedUpdateWithoutEmpleadoInput = {
    idPuestoEmpleadora?: IntFieldUpdateOperationsInput | number
    descripcion?: StringFieldUpdateOperationsInput | string
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UnidadEmpleadoraUpsertWithoutEmpleadoInput = {
    update: XOR<UnidadEmpleadoraUpdateWithoutEmpleadoInput, UnidadEmpleadoraUncheckedUpdateWithoutEmpleadoInput>
    create: XOR<UnidadEmpleadoraCreateWithoutEmpleadoInput, UnidadEmpleadoraUncheckedCreateWithoutEmpleadoInput>
    where?: UnidadEmpleadoraWhereInput
  }

  export type UnidadEmpleadoraUpdateToOneWithWhereWithoutEmpleadoInput = {
    where?: UnidadEmpleadoraWhereInput
    data: XOR<UnidadEmpleadoraUpdateWithoutEmpleadoInput, UnidadEmpleadoraUncheckedUpdateWithoutEmpleadoInput>
  }

  export type UnidadEmpleadoraUpdateWithoutEmpleadoInput = {
    descripcion?: StringFieldUpdateOperationsInput | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    empresaEmpleadora?: EmpresaEmpleadoraUpdateOneRequiredWithoutUnidadEmpleadoraNestedInput
  }

  export type UnidadEmpleadoraUncheckedUpdateWithoutEmpleadoInput = {
    idUnidadEmpleadora?: IntFieldUpdateOperationsInput | number
    descripcion?: StringFieldUpdateOperationsInput | string
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UsuarioUpsertWithoutEmpleadoInput = {
    update: XOR<UsuarioUpdateWithoutEmpleadoInput, UsuarioUncheckedUpdateWithoutEmpleadoInput>
    create: XOR<UsuarioCreateWithoutEmpleadoInput, UsuarioUncheckedCreateWithoutEmpleadoInput>
    where?: UsuarioWhereInput
  }

  export type UsuarioUpdateToOneWithWhereWithoutEmpleadoInput = {
    where?: UsuarioWhereInput
    data: XOR<UsuarioUpdateWithoutEmpleadoInput, UsuarioUncheckedUpdateWithoutEmpleadoInput>
  }

  export type UsuarioUpdateWithoutEmpleadoInput = {
    codigoUsuario?: StringFieldUpdateOperationsInput | string
    correoElectronico?: NullableStringFieldUpdateOperationsInput | string | null
    contrasena?: StringFieldUpdateOperationsInput | string
    rol?: EnumRolFieldUpdateOperationsInput | $Enums.Rol
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UsuarioUncheckedUpdateWithoutEmpleadoInput = {
    idUsuario?: IntFieldUpdateOperationsInput | number
    codigoUsuario?: StringFieldUpdateOperationsInput | string
    correoElectronico?: NullableStringFieldUpdateOperationsInput | string | null
    contrasena?: StringFieldUpdateOperationsInput | string
    rol?: EnumRolFieldUpdateOperationsInput | $Enums.Rol
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ObjetivoUpsertWithWhereUniqueWithoutEmpleadoInput = {
    where: ObjetivoWhereUniqueInput
    update: XOR<ObjetivoUpdateWithoutEmpleadoInput, ObjetivoUncheckedUpdateWithoutEmpleadoInput>
    create: XOR<ObjetivoCreateWithoutEmpleadoInput, ObjetivoUncheckedCreateWithoutEmpleadoInput>
  }

  export type ObjetivoUpdateWithWhereUniqueWithoutEmpleadoInput = {
    where: ObjetivoWhereUniqueInput
    data: XOR<ObjetivoUpdateWithoutEmpleadoInput, ObjetivoUncheckedUpdateWithoutEmpleadoInput>
  }

  export type ObjetivoUpdateManyWithWhereWithoutEmpleadoInput = {
    where: ObjetivoScalarWhereInput
    data: XOR<ObjetivoUpdateManyMutationInput, ObjetivoUncheckedUpdateManyWithoutEmpleadoInput>
  }

  export type ObjetivoScalarWhereInput = {
    AND?: ObjetivoScalarWhereInput | ObjetivoScalarWhereInput[]
    OR?: ObjetivoScalarWhereInput[]
    NOT?: ObjetivoScalarWhereInput | ObjetivoScalarWhereInput[]
    idObjetivo?: IntFilter<"Objetivo"> | number
    fechaVigenciaInicia?: DateTimeFilter<"Objetivo"> | Date | string
    fechaVigenciaFin?: DateTimeFilter<"Objetivo"> | Date | string
    idEmpresaEmpleadora?: IntFilter<"Objetivo"> | number
    idEmpleado?: IntFilter<"Objetivo"> | number
    estado?: BoolFilter<"Objetivo"> | boolean
    creadoPorId?: IntFilter<"Objetivo"> | number
    actualizadoPorId?: IntNullableFilter<"Objetivo"> | number | null
    fechaCreacion?: DateTimeFilter<"Objetivo"> | Date | string
    fechaModificacion?: DateTimeNullableFilter<"Objetivo"> | Date | string | null
  }

  export type EmpleadoCreateWithoutUsuarioInput = {
    nombres: string
    apellidoPaterno: string
    apellidoMaterno: string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    empresaEmpleadora: EmpresaEmpleadoraCreateNestedOneWithoutEmpleadoInput
    equipoEmpleadora: EquipoEmpleadoraCreateNestedOneWithoutEmpleadoInput
    puestoEmpleadora: PuestoEmpleadoraCreateNestedOneWithoutEmpleadoInput
    unidadEmpleadora: UnidadEmpleadoraCreateNestedOneWithoutEmpleadoInput
    objetivo?: ObjetivoCreateNestedManyWithoutEmpleadoInput
  }

  export type EmpleadoUncheckedCreateWithoutUsuarioInput = {
    idEmpleado?: number
    nombres: string
    apellidoPaterno: string
    apellidoMaterno: string
    idEmpresaEmpleadora: number
    idEquipoEmpleadora: number
    idPuestoEmpleadora: number
    idUnidadEmpleadora: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    objetivo?: ObjetivoUncheckedCreateNestedManyWithoutEmpleadoInput
  }

  export type EmpleadoCreateOrConnectWithoutUsuarioInput = {
    where: EmpleadoWhereUniqueInput
    create: XOR<EmpleadoCreateWithoutUsuarioInput, EmpleadoUncheckedCreateWithoutUsuarioInput>
  }

  export type EmpleadoCreateManyUsuarioInputEnvelope = {
    data: EmpleadoCreateManyUsuarioInput | EmpleadoCreateManyUsuarioInput[]
    skipDuplicates?: boolean
  }

  export type EmpleadoUpsertWithWhereUniqueWithoutUsuarioInput = {
    where: EmpleadoWhereUniqueInput
    update: XOR<EmpleadoUpdateWithoutUsuarioInput, EmpleadoUncheckedUpdateWithoutUsuarioInput>
    create: XOR<EmpleadoCreateWithoutUsuarioInput, EmpleadoUncheckedCreateWithoutUsuarioInput>
  }

  export type EmpleadoUpdateWithWhereUniqueWithoutUsuarioInput = {
    where: EmpleadoWhereUniqueInput
    data: XOR<EmpleadoUpdateWithoutUsuarioInput, EmpleadoUncheckedUpdateWithoutUsuarioInput>
  }

  export type EmpleadoUpdateManyWithWhereWithoutUsuarioInput = {
    where: EmpleadoScalarWhereInput
    data: XOR<EmpleadoUpdateManyMutationInput, EmpleadoUncheckedUpdateManyWithoutUsuarioInput>
  }

  export type EmpleadoScalarWhereInput = {
    AND?: EmpleadoScalarWhereInput | EmpleadoScalarWhereInput[]
    OR?: EmpleadoScalarWhereInput[]
    NOT?: EmpleadoScalarWhereInput | EmpleadoScalarWhereInput[]
    idEmpleado?: IntFilter<"Empleado"> | number
    nombres?: StringFilter<"Empleado"> | string
    apellidoPaterno?: StringFilter<"Empleado"> | string
    apellidoMaterno?: StringFilter<"Empleado"> | string
    idEmpresaEmpleadora?: IntFilter<"Empleado"> | number
    idEquipoEmpleadora?: IntFilter<"Empleado"> | number
    idPuestoEmpleadora?: IntFilter<"Empleado"> | number
    idUnidadEmpleadora?: IntFilter<"Empleado"> | number
    idUsuario?: IntFilter<"Empleado"> | number
    estado?: BoolFilter<"Empleado"> | boolean
    creadoPorId?: IntFilter<"Empleado"> | number
    actualizadoPorId?: IntNullableFilter<"Empleado"> | number | null
    fechaCreacion?: DateTimeFilter<"Empleado"> | Date | string
    fechaModificacion?: DateTimeNullableFilter<"Empleado"> | Date | string | null
  }

  export type EquipoEmpleadoraCreateWithoutEmpresaEmpleadoraInput = {
    descripcion: string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    Empleado?: EmpleadoCreateNestedManyWithoutEquipoEmpleadoraInput
  }

  export type EquipoEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput = {
    idEquipoEmpleadora?: number
    descripcion: string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    Empleado?: EmpleadoUncheckedCreateNestedManyWithoutEquipoEmpleadoraInput
  }

  export type EquipoEmpleadoraCreateOrConnectWithoutEmpresaEmpleadoraInput = {
    where: EquipoEmpleadoraWhereUniqueInput
    create: XOR<EquipoEmpleadoraCreateWithoutEmpresaEmpleadoraInput, EquipoEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput>
  }

  export type EquipoEmpleadoraCreateManyEmpresaEmpleadoraInputEnvelope = {
    data: EquipoEmpleadoraCreateManyEmpresaEmpleadoraInput | EquipoEmpleadoraCreateManyEmpresaEmpleadoraInput[]
    skipDuplicates?: boolean
  }

  export type PuestoEmpleadoraCreateWithoutEmpresaEmpleadoraInput = {
    descripcion: string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    Empleado?: EmpleadoCreateNestedManyWithoutPuestoEmpleadoraInput
  }

  export type PuestoEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput = {
    idPuestoEmpleadora?: number
    descripcion: string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    Empleado?: EmpleadoUncheckedCreateNestedManyWithoutPuestoEmpleadoraInput
  }

  export type PuestoEmpleadoraCreateOrConnectWithoutEmpresaEmpleadoraInput = {
    where: PuestoEmpleadoraWhereUniqueInput
    create: XOR<PuestoEmpleadoraCreateWithoutEmpresaEmpleadoraInput, PuestoEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput>
  }

  export type PuestoEmpleadoraCreateManyEmpresaEmpleadoraInputEnvelope = {
    data: PuestoEmpleadoraCreateManyEmpresaEmpleadoraInput | PuestoEmpleadoraCreateManyEmpresaEmpleadoraInput[]
    skipDuplicates?: boolean
  }

  export type UnidadEmpleadoraCreateWithoutEmpresaEmpleadoraInput = {
    descripcion: string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    empleado?: EmpleadoCreateNestedManyWithoutUnidadEmpleadoraInput
  }

  export type UnidadEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput = {
    idUnidadEmpleadora?: number
    descripcion: string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    empleado?: EmpleadoUncheckedCreateNestedManyWithoutUnidadEmpleadoraInput
  }

  export type UnidadEmpleadoraCreateOrConnectWithoutEmpresaEmpleadoraInput = {
    where: UnidadEmpleadoraWhereUniqueInput
    create: XOR<UnidadEmpleadoraCreateWithoutEmpresaEmpleadoraInput, UnidadEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput>
  }

  export type UnidadEmpleadoraCreateManyEmpresaEmpleadoraInputEnvelope = {
    data: UnidadEmpleadoraCreateManyEmpresaEmpleadoraInput | UnidadEmpleadoraCreateManyEmpresaEmpleadoraInput[]
    skipDuplicates?: boolean
  }

  export type ObjetivoCreateWithoutEmpresaEmpleadoraInput = {
    fechaVigenciaInicia: Date | string
    fechaVigenciaFin: Date | string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    empleado: EmpleadoCreateNestedOneWithoutObjetivoInput
    ObjetivoDetalle?: ObjetivoDetalleCreateNestedManyWithoutObjetivoInput
  }

  export type ObjetivoUncheckedCreateWithoutEmpresaEmpleadoraInput = {
    idObjetivo?: number
    fechaVigenciaInicia: Date | string
    fechaVigenciaFin: Date | string
    idEmpleado: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    ObjetivoDetalle?: ObjetivoDetalleUncheckedCreateNestedManyWithoutObjetivoInput
  }

  export type ObjetivoCreateOrConnectWithoutEmpresaEmpleadoraInput = {
    where: ObjetivoWhereUniqueInput
    create: XOR<ObjetivoCreateWithoutEmpresaEmpleadoraInput, ObjetivoUncheckedCreateWithoutEmpresaEmpleadoraInput>
  }

  export type ObjetivoCreateManyEmpresaEmpleadoraInputEnvelope = {
    data: ObjetivoCreateManyEmpresaEmpleadoraInput | ObjetivoCreateManyEmpresaEmpleadoraInput[]
    skipDuplicates?: boolean
  }

  export type EmpleadoCreateWithoutEmpresaEmpleadoraInput = {
    nombres: string
    apellidoPaterno: string
    apellidoMaterno: string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    equipoEmpleadora: EquipoEmpleadoraCreateNestedOneWithoutEmpleadoInput
    puestoEmpleadora: PuestoEmpleadoraCreateNestedOneWithoutEmpleadoInput
    unidadEmpleadora: UnidadEmpleadoraCreateNestedOneWithoutEmpleadoInput
    usuario: UsuarioCreateNestedOneWithoutEmpleadoInput
    objetivo?: ObjetivoCreateNestedManyWithoutEmpleadoInput
  }

  export type EmpleadoUncheckedCreateWithoutEmpresaEmpleadoraInput = {
    idEmpleado?: number
    nombres: string
    apellidoPaterno: string
    apellidoMaterno: string
    idEquipoEmpleadora: number
    idPuestoEmpleadora: number
    idUnidadEmpleadora: number
    idUsuario: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    objetivo?: ObjetivoUncheckedCreateNestedManyWithoutEmpleadoInput
  }

  export type EmpleadoCreateOrConnectWithoutEmpresaEmpleadoraInput = {
    where: EmpleadoWhereUniqueInput
    create: XOR<EmpleadoCreateWithoutEmpresaEmpleadoraInput, EmpleadoUncheckedCreateWithoutEmpresaEmpleadoraInput>
  }

  export type EmpleadoCreateManyEmpresaEmpleadoraInputEnvelope = {
    data: EmpleadoCreateManyEmpresaEmpleadoraInput | EmpleadoCreateManyEmpresaEmpleadoraInput[]
    skipDuplicates?: boolean
  }

  export type EquipoEmpleadoraUpsertWithWhereUniqueWithoutEmpresaEmpleadoraInput = {
    where: EquipoEmpleadoraWhereUniqueInput
    update: XOR<EquipoEmpleadoraUpdateWithoutEmpresaEmpleadoraInput, EquipoEmpleadoraUncheckedUpdateWithoutEmpresaEmpleadoraInput>
    create: XOR<EquipoEmpleadoraCreateWithoutEmpresaEmpleadoraInput, EquipoEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput>
  }

  export type EquipoEmpleadoraUpdateWithWhereUniqueWithoutEmpresaEmpleadoraInput = {
    where: EquipoEmpleadoraWhereUniqueInput
    data: XOR<EquipoEmpleadoraUpdateWithoutEmpresaEmpleadoraInput, EquipoEmpleadoraUncheckedUpdateWithoutEmpresaEmpleadoraInput>
  }

  export type EquipoEmpleadoraUpdateManyWithWhereWithoutEmpresaEmpleadoraInput = {
    where: EquipoEmpleadoraScalarWhereInput
    data: XOR<EquipoEmpleadoraUpdateManyMutationInput, EquipoEmpleadoraUncheckedUpdateManyWithoutEmpresaEmpleadoraInput>
  }

  export type EquipoEmpleadoraScalarWhereInput = {
    AND?: EquipoEmpleadoraScalarWhereInput | EquipoEmpleadoraScalarWhereInput[]
    OR?: EquipoEmpleadoraScalarWhereInput[]
    NOT?: EquipoEmpleadoraScalarWhereInput | EquipoEmpleadoraScalarWhereInput[]
    idEquipoEmpleadora?: IntFilter<"EquipoEmpleadora"> | number
    descripcion?: StringFilter<"EquipoEmpleadora"> | string
    idEmpresaEmpleadora?: IntFilter<"EquipoEmpleadora"> | number
    estado?: BoolFilter<"EquipoEmpleadora"> | boolean
    creadoPorId?: IntFilter<"EquipoEmpleadora"> | number
    actualizadoPorId?: IntNullableFilter<"EquipoEmpleadora"> | number | null
    fechaCreacion?: DateTimeFilter<"EquipoEmpleadora"> | Date | string
    fechaModificacion?: DateTimeNullableFilter<"EquipoEmpleadora"> | Date | string | null
  }

  export type PuestoEmpleadoraUpsertWithWhereUniqueWithoutEmpresaEmpleadoraInput = {
    where: PuestoEmpleadoraWhereUniqueInput
    update: XOR<PuestoEmpleadoraUpdateWithoutEmpresaEmpleadoraInput, PuestoEmpleadoraUncheckedUpdateWithoutEmpresaEmpleadoraInput>
    create: XOR<PuestoEmpleadoraCreateWithoutEmpresaEmpleadoraInput, PuestoEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput>
  }

  export type PuestoEmpleadoraUpdateWithWhereUniqueWithoutEmpresaEmpleadoraInput = {
    where: PuestoEmpleadoraWhereUniqueInput
    data: XOR<PuestoEmpleadoraUpdateWithoutEmpresaEmpleadoraInput, PuestoEmpleadoraUncheckedUpdateWithoutEmpresaEmpleadoraInput>
  }

  export type PuestoEmpleadoraUpdateManyWithWhereWithoutEmpresaEmpleadoraInput = {
    where: PuestoEmpleadoraScalarWhereInput
    data: XOR<PuestoEmpleadoraUpdateManyMutationInput, PuestoEmpleadoraUncheckedUpdateManyWithoutEmpresaEmpleadoraInput>
  }

  export type PuestoEmpleadoraScalarWhereInput = {
    AND?: PuestoEmpleadoraScalarWhereInput | PuestoEmpleadoraScalarWhereInput[]
    OR?: PuestoEmpleadoraScalarWhereInput[]
    NOT?: PuestoEmpleadoraScalarWhereInput | PuestoEmpleadoraScalarWhereInput[]
    idPuestoEmpleadora?: IntFilter<"PuestoEmpleadora"> | number
    descripcion?: StringFilter<"PuestoEmpleadora"> | string
    idEmpresaEmpleadora?: IntFilter<"PuestoEmpleadora"> | number
    estado?: BoolFilter<"PuestoEmpleadora"> | boolean
    creadoPorId?: IntFilter<"PuestoEmpleadora"> | number
    actualizadoPorId?: IntNullableFilter<"PuestoEmpleadora"> | number | null
    fechaCreacion?: DateTimeFilter<"PuestoEmpleadora"> | Date | string
    fechaModificacion?: DateTimeNullableFilter<"PuestoEmpleadora"> | Date | string | null
  }

  export type UnidadEmpleadoraUpsertWithWhereUniqueWithoutEmpresaEmpleadoraInput = {
    where: UnidadEmpleadoraWhereUniqueInput
    update: XOR<UnidadEmpleadoraUpdateWithoutEmpresaEmpleadoraInput, UnidadEmpleadoraUncheckedUpdateWithoutEmpresaEmpleadoraInput>
    create: XOR<UnidadEmpleadoraCreateWithoutEmpresaEmpleadoraInput, UnidadEmpleadoraUncheckedCreateWithoutEmpresaEmpleadoraInput>
  }

  export type UnidadEmpleadoraUpdateWithWhereUniqueWithoutEmpresaEmpleadoraInput = {
    where: UnidadEmpleadoraWhereUniqueInput
    data: XOR<UnidadEmpleadoraUpdateWithoutEmpresaEmpleadoraInput, UnidadEmpleadoraUncheckedUpdateWithoutEmpresaEmpleadoraInput>
  }

  export type UnidadEmpleadoraUpdateManyWithWhereWithoutEmpresaEmpleadoraInput = {
    where: UnidadEmpleadoraScalarWhereInput
    data: XOR<UnidadEmpleadoraUpdateManyMutationInput, UnidadEmpleadoraUncheckedUpdateManyWithoutEmpresaEmpleadoraInput>
  }

  export type UnidadEmpleadoraScalarWhereInput = {
    AND?: UnidadEmpleadoraScalarWhereInput | UnidadEmpleadoraScalarWhereInput[]
    OR?: UnidadEmpleadoraScalarWhereInput[]
    NOT?: UnidadEmpleadoraScalarWhereInput | UnidadEmpleadoraScalarWhereInput[]
    idUnidadEmpleadora?: IntFilter<"UnidadEmpleadora"> | number
    descripcion?: StringFilter<"UnidadEmpleadora"> | string
    idEmpresaEmpleadora?: IntFilter<"UnidadEmpleadora"> | number
    estado?: BoolFilter<"UnidadEmpleadora"> | boolean
    creadoPorId?: IntFilter<"UnidadEmpleadora"> | number
    actualizadoPorId?: IntNullableFilter<"UnidadEmpleadora"> | number | null
    fechaCreacion?: DateTimeFilter<"UnidadEmpleadora"> | Date | string
    fechaModificacion?: DateTimeNullableFilter<"UnidadEmpleadora"> | Date | string | null
  }

  export type ObjetivoUpsertWithWhereUniqueWithoutEmpresaEmpleadoraInput = {
    where: ObjetivoWhereUniqueInput
    update: XOR<ObjetivoUpdateWithoutEmpresaEmpleadoraInput, ObjetivoUncheckedUpdateWithoutEmpresaEmpleadoraInput>
    create: XOR<ObjetivoCreateWithoutEmpresaEmpleadoraInput, ObjetivoUncheckedCreateWithoutEmpresaEmpleadoraInput>
  }

  export type ObjetivoUpdateWithWhereUniqueWithoutEmpresaEmpleadoraInput = {
    where: ObjetivoWhereUniqueInput
    data: XOR<ObjetivoUpdateWithoutEmpresaEmpleadoraInput, ObjetivoUncheckedUpdateWithoutEmpresaEmpleadoraInput>
  }

  export type ObjetivoUpdateManyWithWhereWithoutEmpresaEmpleadoraInput = {
    where: ObjetivoScalarWhereInput
    data: XOR<ObjetivoUpdateManyMutationInput, ObjetivoUncheckedUpdateManyWithoutEmpresaEmpleadoraInput>
  }

  export type EmpleadoUpsertWithWhereUniqueWithoutEmpresaEmpleadoraInput = {
    where: EmpleadoWhereUniqueInput
    update: XOR<EmpleadoUpdateWithoutEmpresaEmpleadoraInput, EmpleadoUncheckedUpdateWithoutEmpresaEmpleadoraInput>
    create: XOR<EmpleadoCreateWithoutEmpresaEmpleadoraInput, EmpleadoUncheckedCreateWithoutEmpresaEmpleadoraInput>
  }

  export type EmpleadoUpdateWithWhereUniqueWithoutEmpresaEmpleadoraInput = {
    where: EmpleadoWhereUniqueInput
    data: XOR<EmpleadoUpdateWithoutEmpresaEmpleadoraInput, EmpleadoUncheckedUpdateWithoutEmpresaEmpleadoraInput>
  }

  export type EmpleadoUpdateManyWithWhereWithoutEmpresaEmpleadoraInput = {
    where: EmpleadoScalarWhereInput
    data: XOR<EmpleadoUpdateManyMutationInput, EmpleadoUncheckedUpdateManyWithoutEmpresaEmpleadoraInput>
  }

  export type EmpresaEmpleadoraCreateWithoutEquipoEmpleadoraInput = {
    nombreEmpresa: string
    ruc?: string | null
    direccionEmpresa?: string | null
    urlLogo: string
    fechaVigenciaInicio: Date | string
    fechaVigenciaFin: Date | string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    puestoEmpleadora?: PuestoEmpleadoraCreateNestedManyWithoutEmpresaEmpleadoraInput
    unidadEmpleadora?: UnidadEmpleadoraCreateNestedManyWithoutEmpresaEmpleadoraInput
    objetivo?: ObjetivoCreateNestedManyWithoutEmpresaEmpleadoraInput
    empleado?: EmpleadoCreateNestedManyWithoutEmpresaEmpleadoraInput
  }

  export type EmpresaEmpleadoraUncheckedCreateWithoutEquipoEmpleadoraInput = {
    idEmpresaEmpleadora?: number
    nombreEmpresa: string
    ruc?: string | null
    direccionEmpresa?: string | null
    urlLogo: string
    fechaVigenciaInicio: Date | string
    fechaVigenciaFin: Date | string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    puestoEmpleadora?: PuestoEmpleadoraUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput
    unidadEmpleadora?: UnidadEmpleadoraUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput
    objetivo?: ObjetivoUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput
    empleado?: EmpleadoUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput
  }

  export type EmpresaEmpleadoraCreateOrConnectWithoutEquipoEmpleadoraInput = {
    where: EmpresaEmpleadoraWhereUniqueInput
    create: XOR<EmpresaEmpleadoraCreateWithoutEquipoEmpleadoraInput, EmpresaEmpleadoraUncheckedCreateWithoutEquipoEmpleadoraInput>
  }

  export type EmpleadoCreateWithoutEquipoEmpleadoraInput = {
    nombres: string
    apellidoPaterno: string
    apellidoMaterno: string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    empresaEmpleadora: EmpresaEmpleadoraCreateNestedOneWithoutEmpleadoInput
    puestoEmpleadora: PuestoEmpleadoraCreateNestedOneWithoutEmpleadoInput
    unidadEmpleadora: UnidadEmpleadoraCreateNestedOneWithoutEmpleadoInput
    usuario: UsuarioCreateNestedOneWithoutEmpleadoInput
    objetivo?: ObjetivoCreateNestedManyWithoutEmpleadoInput
  }

  export type EmpleadoUncheckedCreateWithoutEquipoEmpleadoraInput = {
    idEmpleado?: number
    nombres: string
    apellidoPaterno: string
    apellidoMaterno: string
    idEmpresaEmpleadora: number
    idPuestoEmpleadora: number
    idUnidadEmpleadora: number
    idUsuario: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    objetivo?: ObjetivoUncheckedCreateNestedManyWithoutEmpleadoInput
  }

  export type EmpleadoCreateOrConnectWithoutEquipoEmpleadoraInput = {
    where: EmpleadoWhereUniqueInput
    create: XOR<EmpleadoCreateWithoutEquipoEmpleadoraInput, EmpleadoUncheckedCreateWithoutEquipoEmpleadoraInput>
  }

  export type EmpleadoCreateManyEquipoEmpleadoraInputEnvelope = {
    data: EmpleadoCreateManyEquipoEmpleadoraInput | EmpleadoCreateManyEquipoEmpleadoraInput[]
    skipDuplicates?: boolean
  }

  export type EmpresaEmpleadoraUpsertWithoutEquipoEmpleadoraInput = {
    update: XOR<EmpresaEmpleadoraUpdateWithoutEquipoEmpleadoraInput, EmpresaEmpleadoraUncheckedUpdateWithoutEquipoEmpleadoraInput>
    create: XOR<EmpresaEmpleadoraCreateWithoutEquipoEmpleadoraInput, EmpresaEmpleadoraUncheckedCreateWithoutEquipoEmpleadoraInput>
    where?: EmpresaEmpleadoraWhereInput
  }

  export type EmpresaEmpleadoraUpdateToOneWithWhereWithoutEquipoEmpleadoraInput = {
    where?: EmpresaEmpleadoraWhereInput
    data: XOR<EmpresaEmpleadoraUpdateWithoutEquipoEmpleadoraInput, EmpresaEmpleadoraUncheckedUpdateWithoutEquipoEmpleadoraInput>
  }

  export type EmpresaEmpleadoraUpdateWithoutEquipoEmpleadoraInput = {
    nombreEmpresa?: StringFieldUpdateOperationsInput | string
    ruc?: NullableStringFieldUpdateOperationsInput | string | null
    direccionEmpresa?: NullableStringFieldUpdateOperationsInput | string | null
    urlLogo?: StringFieldUpdateOperationsInput | string
    fechaVigenciaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVigenciaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    puestoEmpleadora?: PuestoEmpleadoraUpdateManyWithoutEmpresaEmpleadoraNestedInput
    unidadEmpleadora?: UnidadEmpleadoraUpdateManyWithoutEmpresaEmpleadoraNestedInput
    objetivo?: ObjetivoUpdateManyWithoutEmpresaEmpleadoraNestedInput
    empleado?: EmpleadoUpdateManyWithoutEmpresaEmpleadoraNestedInput
  }

  export type EmpresaEmpleadoraUncheckedUpdateWithoutEquipoEmpleadoraInput = {
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    nombreEmpresa?: StringFieldUpdateOperationsInput | string
    ruc?: NullableStringFieldUpdateOperationsInput | string | null
    direccionEmpresa?: NullableStringFieldUpdateOperationsInput | string | null
    urlLogo?: StringFieldUpdateOperationsInput | string
    fechaVigenciaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVigenciaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    puestoEmpleadora?: PuestoEmpleadoraUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput
    unidadEmpleadora?: UnidadEmpleadoraUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput
    objetivo?: ObjetivoUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput
    empleado?: EmpleadoUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput
  }

  export type EmpleadoUpsertWithWhereUniqueWithoutEquipoEmpleadoraInput = {
    where: EmpleadoWhereUniqueInput
    update: XOR<EmpleadoUpdateWithoutEquipoEmpleadoraInput, EmpleadoUncheckedUpdateWithoutEquipoEmpleadoraInput>
    create: XOR<EmpleadoCreateWithoutEquipoEmpleadoraInput, EmpleadoUncheckedCreateWithoutEquipoEmpleadoraInput>
  }

  export type EmpleadoUpdateWithWhereUniqueWithoutEquipoEmpleadoraInput = {
    where: EmpleadoWhereUniqueInput
    data: XOR<EmpleadoUpdateWithoutEquipoEmpleadoraInput, EmpleadoUncheckedUpdateWithoutEquipoEmpleadoraInput>
  }

  export type EmpleadoUpdateManyWithWhereWithoutEquipoEmpleadoraInput = {
    where: EmpleadoScalarWhereInput
    data: XOR<EmpleadoUpdateManyMutationInput, EmpleadoUncheckedUpdateManyWithoutEquipoEmpleadoraInput>
  }

  export type EmpresaEmpleadoraCreateWithoutPuestoEmpleadoraInput = {
    nombreEmpresa: string
    ruc?: string | null
    direccionEmpresa?: string | null
    urlLogo: string
    fechaVigenciaInicio: Date | string
    fechaVigenciaFin: Date | string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    equipoEmpleadora?: EquipoEmpleadoraCreateNestedManyWithoutEmpresaEmpleadoraInput
    unidadEmpleadora?: UnidadEmpleadoraCreateNestedManyWithoutEmpresaEmpleadoraInput
    objetivo?: ObjetivoCreateNestedManyWithoutEmpresaEmpleadoraInput
    empleado?: EmpleadoCreateNestedManyWithoutEmpresaEmpleadoraInput
  }

  export type EmpresaEmpleadoraUncheckedCreateWithoutPuestoEmpleadoraInput = {
    idEmpresaEmpleadora?: number
    nombreEmpresa: string
    ruc?: string | null
    direccionEmpresa?: string | null
    urlLogo: string
    fechaVigenciaInicio: Date | string
    fechaVigenciaFin: Date | string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    equipoEmpleadora?: EquipoEmpleadoraUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput
    unidadEmpleadora?: UnidadEmpleadoraUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput
    objetivo?: ObjetivoUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput
    empleado?: EmpleadoUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput
  }

  export type EmpresaEmpleadoraCreateOrConnectWithoutPuestoEmpleadoraInput = {
    where: EmpresaEmpleadoraWhereUniqueInput
    create: XOR<EmpresaEmpleadoraCreateWithoutPuestoEmpleadoraInput, EmpresaEmpleadoraUncheckedCreateWithoutPuestoEmpleadoraInput>
  }

  export type EmpleadoCreateWithoutPuestoEmpleadoraInput = {
    nombres: string
    apellidoPaterno: string
    apellidoMaterno: string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    empresaEmpleadora: EmpresaEmpleadoraCreateNestedOneWithoutEmpleadoInput
    equipoEmpleadora: EquipoEmpleadoraCreateNestedOneWithoutEmpleadoInput
    unidadEmpleadora: UnidadEmpleadoraCreateNestedOneWithoutEmpleadoInput
    usuario: UsuarioCreateNestedOneWithoutEmpleadoInput
    objetivo?: ObjetivoCreateNestedManyWithoutEmpleadoInput
  }

  export type EmpleadoUncheckedCreateWithoutPuestoEmpleadoraInput = {
    idEmpleado?: number
    nombres: string
    apellidoPaterno: string
    apellidoMaterno: string
    idEmpresaEmpleadora: number
    idEquipoEmpleadora: number
    idUnidadEmpleadora: number
    idUsuario: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    objetivo?: ObjetivoUncheckedCreateNestedManyWithoutEmpleadoInput
  }

  export type EmpleadoCreateOrConnectWithoutPuestoEmpleadoraInput = {
    where: EmpleadoWhereUniqueInput
    create: XOR<EmpleadoCreateWithoutPuestoEmpleadoraInput, EmpleadoUncheckedCreateWithoutPuestoEmpleadoraInput>
  }

  export type EmpleadoCreateManyPuestoEmpleadoraInputEnvelope = {
    data: EmpleadoCreateManyPuestoEmpleadoraInput | EmpleadoCreateManyPuestoEmpleadoraInput[]
    skipDuplicates?: boolean
  }

  export type EmpresaEmpleadoraUpsertWithoutPuestoEmpleadoraInput = {
    update: XOR<EmpresaEmpleadoraUpdateWithoutPuestoEmpleadoraInput, EmpresaEmpleadoraUncheckedUpdateWithoutPuestoEmpleadoraInput>
    create: XOR<EmpresaEmpleadoraCreateWithoutPuestoEmpleadoraInput, EmpresaEmpleadoraUncheckedCreateWithoutPuestoEmpleadoraInput>
    where?: EmpresaEmpleadoraWhereInput
  }

  export type EmpresaEmpleadoraUpdateToOneWithWhereWithoutPuestoEmpleadoraInput = {
    where?: EmpresaEmpleadoraWhereInput
    data: XOR<EmpresaEmpleadoraUpdateWithoutPuestoEmpleadoraInput, EmpresaEmpleadoraUncheckedUpdateWithoutPuestoEmpleadoraInput>
  }

  export type EmpresaEmpleadoraUpdateWithoutPuestoEmpleadoraInput = {
    nombreEmpresa?: StringFieldUpdateOperationsInput | string
    ruc?: NullableStringFieldUpdateOperationsInput | string | null
    direccionEmpresa?: NullableStringFieldUpdateOperationsInput | string | null
    urlLogo?: StringFieldUpdateOperationsInput | string
    fechaVigenciaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVigenciaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    equipoEmpleadora?: EquipoEmpleadoraUpdateManyWithoutEmpresaEmpleadoraNestedInput
    unidadEmpleadora?: UnidadEmpleadoraUpdateManyWithoutEmpresaEmpleadoraNestedInput
    objetivo?: ObjetivoUpdateManyWithoutEmpresaEmpleadoraNestedInput
    empleado?: EmpleadoUpdateManyWithoutEmpresaEmpleadoraNestedInput
  }

  export type EmpresaEmpleadoraUncheckedUpdateWithoutPuestoEmpleadoraInput = {
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    nombreEmpresa?: StringFieldUpdateOperationsInput | string
    ruc?: NullableStringFieldUpdateOperationsInput | string | null
    direccionEmpresa?: NullableStringFieldUpdateOperationsInput | string | null
    urlLogo?: StringFieldUpdateOperationsInput | string
    fechaVigenciaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVigenciaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    equipoEmpleadora?: EquipoEmpleadoraUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput
    unidadEmpleadora?: UnidadEmpleadoraUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput
    objetivo?: ObjetivoUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput
    empleado?: EmpleadoUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput
  }

  export type EmpleadoUpsertWithWhereUniqueWithoutPuestoEmpleadoraInput = {
    where: EmpleadoWhereUniqueInput
    update: XOR<EmpleadoUpdateWithoutPuestoEmpleadoraInput, EmpleadoUncheckedUpdateWithoutPuestoEmpleadoraInput>
    create: XOR<EmpleadoCreateWithoutPuestoEmpleadoraInput, EmpleadoUncheckedCreateWithoutPuestoEmpleadoraInput>
  }

  export type EmpleadoUpdateWithWhereUniqueWithoutPuestoEmpleadoraInput = {
    where: EmpleadoWhereUniqueInput
    data: XOR<EmpleadoUpdateWithoutPuestoEmpleadoraInput, EmpleadoUncheckedUpdateWithoutPuestoEmpleadoraInput>
  }

  export type EmpleadoUpdateManyWithWhereWithoutPuestoEmpleadoraInput = {
    where: EmpleadoScalarWhereInput
    data: XOR<EmpleadoUpdateManyMutationInput, EmpleadoUncheckedUpdateManyWithoutPuestoEmpleadoraInput>
  }

  export type EmpresaEmpleadoraCreateWithoutUnidadEmpleadoraInput = {
    nombreEmpresa: string
    ruc?: string | null
    direccionEmpresa?: string | null
    urlLogo: string
    fechaVigenciaInicio: Date | string
    fechaVigenciaFin: Date | string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    equipoEmpleadora?: EquipoEmpleadoraCreateNestedManyWithoutEmpresaEmpleadoraInput
    puestoEmpleadora?: PuestoEmpleadoraCreateNestedManyWithoutEmpresaEmpleadoraInput
    objetivo?: ObjetivoCreateNestedManyWithoutEmpresaEmpleadoraInput
    empleado?: EmpleadoCreateNestedManyWithoutEmpresaEmpleadoraInput
  }

  export type EmpresaEmpleadoraUncheckedCreateWithoutUnidadEmpleadoraInput = {
    idEmpresaEmpleadora?: number
    nombreEmpresa: string
    ruc?: string | null
    direccionEmpresa?: string | null
    urlLogo: string
    fechaVigenciaInicio: Date | string
    fechaVigenciaFin: Date | string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    equipoEmpleadora?: EquipoEmpleadoraUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput
    puestoEmpleadora?: PuestoEmpleadoraUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput
    objetivo?: ObjetivoUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput
    empleado?: EmpleadoUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput
  }

  export type EmpresaEmpleadoraCreateOrConnectWithoutUnidadEmpleadoraInput = {
    where: EmpresaEmpleadoraWhereUniqueInput
    create: XOR<EmpresaEmpleadoraCreateWithoutUnidadEmpleadoraInput, EmpresaEmpleadoraUncheckedCreateWithoutUnidadEmpleadoraInput>
  }

  export type EmpleadoCreateWithoutUnidadEmpleadoraInput = {
    nombres: string
    apellidoPaterno: string
    apellidoMaterno: string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    empresaEmpleadora: EmpresaEmpleadoraCreateNestedOneWithoutEmpleadoInput
    equipoEmpleadora: EquipoEmpleadoraCreateNestedOneWithoutEmpleadoInput
    puestoEmpleadora: PuestoEmpleadoraCreateNestedOneWithoutEmpleadoInput
    usuario: UsuarioCreateNestedOneWithoutEmpleadoInput
    objetivo?: ObjetivoCreateNestedManyWithoutEmpleadoInput
  }

  export type EmpleadoUncheckedCreateWithoutUnidadEmpleadoraInput = {
    idEmpleado?: number
    nombres: string
    apellidoPaterno: string
    apellidoMaterno: string
    idEmpresaEmpleadora: number
    idEquipoEmpleadora: number
    idPuestoEmpleadora: number
    idUsuario: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    objetivo?: ObjetivoUncheckedCreateNestedManyWithoutEmpleadoInput
  }

  export type EmpleadoCreateOrConnectWithoutUnidadEmpleadoraInput = {
    where: EmpleadoWhereUniqueInput
    create: XOR<EmpleadoCreateWithoutUnidadEmpleadoraInput, EmpleadoUncheckedCreateWithoutUnidadEmpleadoraInput>
  }

  export type EmpleadoCreateManyUnidadEmpleadoraInputEnvelope = {
    data: EmpleadoCreateManyUnidadEmpleadoraInput | EmpleadoCreateManyUnidadEmpleadoraInput[]
    skipDuplicates?: boolean
  }

  export type EmpresaEmpleadoraUpsertWithoutUnidadEmpleadoraInput = {
    update: XOR<EmpresaEmpleadoraUpdateWithoutUnidadEmpleadoraInput, EmpresaEmpleadoraUncheckedUpdateWithoutUnidadEmpleadoraInput>
    create: XOR<EmpresaEmpleadoraCreateWithoutUnidadEmpleadoraInput, EmpresaEmpleadoraUncheckedCreateWithoutUnidadEmpleadoraInput>
    where?: EmpresaEmpleadoraWhereInput
  }

  export type EmpresaEmpleadoraUpdateToOneWithWhereWithoutUnidadEmpleadoraInput = {
    where?: EmpresaEmpleadoraWhereInput
    data: XOR<EmpresaEmpleadoraUpdateWithoutUnidadEmpleadoraInput, EmpresaEmpleadoraUncheckedUpdateWithoutUnidadEmpleadoraInput>
  }

  export type EmpresaEmpleadoraUpdateWithoutUnidadEmpleadoraInput = {
    nombreEmpresa?: StringFieldUpdateOperationsInput | string
    ruc?: NullableStringFieldUpdateOperationsInput | string | null
    direccionEmpresa?: NullableStringFieldUpdateOperationsInput | string | null
    urlLogo?: StringFieldUpdateOperationsInput | string
    fechaVigenciaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVigenciaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    equipoEmpleadora?: EquipoEmpleadoraUpdateManyWithoutEmpresaEmpleadoraNestedInput
    puestoEmpleadora?: PuestoEmpleadoraUpdateManyWithoutEmpresaEmpleadoraNestedInput
    objetivo?: ObjetivoUpdateManyWithoutEmpresaEmpleadoraNestedInput
    empleado?: EmpleadoUpdateManyWithoutEmpresaEmpleadoraNestedInput
  }

  export type EmpresaEmpleadoraUncheckedUpdateWithoutUnidadEmpleadoraInput = {
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    nombreEmpresa?: StringFieldUpdateOperationsInput | string
    ruc?: NullableStringFieldUpdateOperationsInput | string | null
    direccionEmpresa?: NullableStringFieldUpdateOperationsInput | string | null
    urlLogo?: StringFieldUpdateOperationsInput | string
    fechaVigenciaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVigenciaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    equipoEmpleadora?: EquipoEmpleadoraUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput
    puestoEmpleadora?: PuestoEmpleadoraUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput
    objetivo?: ObjetivoUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput
    empleado?: EmpleadoUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput
  }

  export type EmpleadoUpsertWithWhereUniqueWithoutUnidadEmpleadoraInput = {
    where: EmpleadoWhereUniqueInput
    update: XOR<EmpleadoUpdateWithoutUnidadEmpleadoraInput, EmpleadoUncheckedUpdateWithoutUnidadEmpleadoraInput>
    create: XOR<EmpleadoCreateWithoutUnidadEmpleadoraInput, EmpleadoUncheckedCreateWithoutUnidadEmpleadoraInput>
  }

  export type EmpleadoUpdateWithWhereUniqueWithoutUnidadEmpleadoraInput = {
    where: EmpleadoWhereUniqueInput
    data: XOR<EmpleadoUpdateWithoutUnidadEmpleadoraInput, EmpleadoUncheckedUpdateWithoutUnidadEmpleadoraInput>
  }

  export type EmpleadoUpdateManyWithWhereWithoutUnidadEmpleadoraInput = {
    where: EmpleadoScalarWhereInput
    data: XOR<EmpleadoUpdateManyMutationInput, EmpleadoUncheckedUpdateManyWithoutUnidadEmpleadoraInput>
  }

  export type EmpresaEmpleadoraCreateWithoutObjetivoInput = {
    nombreEmpresa: string
    ruc?: string | null
    direccionEmpresa?: string | null
    urlLogo: string
    fechaVigenciaInicio: Date | string
    fechaVigenciaFin: Date | string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    equipoEmpleadora?: EquipoEmpleadoraCreateNestedManyWithoutEmpresaEmpleadoraInput
    puestoEmpleadora?: PuestoEmpleadoraCreateNestedManyWithoutEmpresaEmpleadoraInput
    unidadEmpleadora?: UnidadEmpleadoraCreateNestedManyWithoutEmpresaEmpleadoraInput
    empleado?: EmpleadoCreateNestedManyWithoutEmpresaEmpleadoraInput
  }

  export type EmpresaEmpleadoraUncheckedCreateWithoutObjetivoInput = {
    idEmpresaEmpleadora?: number
    nombreEmpresa: string
    ruc?: string | null
    direccionEmpresa?: string | null
    urlLogo: string
    fechaVigenciaInicio: Date | string
    fechaVigenciaFin: Date | string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    equipoEmpleadora?: EquipoEmpleadoraUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput
    puestoEmpleadora?: PuestoEmpleadoraUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput
    unidadEmpleadora?: UnidadEmpleadoraUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput
    empleado?: EmpleadoUncheckedCreateNestedManyWithoutEmpresaEmpleadoraInput
  }

  export type EmpresaEmpleadoraCreateOrConnectWithoutObjetivoInput = {
    where: EmpresaEmpleadoraWhereUniqueInput
    create: XOR<EmpresaEmpleadoraCreateWithoutObjetivoInput, EmpresaEmpleadoraUncheckedCreateWithoutObjetivoInput>
  }

  export type EmpleadoCreateWithoutObjetivoInput = {
    nombres: string
    apellidoPaterno: string
    apellidoMaterno: string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    empresaEmpleadora: EmpresaEmpleadoraCreateNestedOneWithoutEmpleadoInput
    equipoEmpleadora: EquipoEmpleadoraCreateNestedOneWithoutEmpleadoInput
    puestoEmpleadora: PuestoEmpleadoraCreateNestedOneWithoutEmpleadoInput
    unidadEmpleadora: UnidadEmpleadoraCreateNestedOneWithoutEmpleadoInput
    usuario: UsuarioCreateNestedOneWithoutEmpleadoInput
  }

  export type EmpleadoUncheckedCreateWithoutObjetivoInput = {
    idEmpleado?: number
    nombres: string
    apellidoPaterno: string
    apellidoMaterno: string
    idEmpresaEmpleadora: number
    idEquipoEmpleadora: number
    idPuestoEmpleadora: number
    idUnidadEmpleadora: number
    idUsuario: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type EmpleadoCreateOrConnectWithoutObjetivoInput = {
    where: EmpleadoWhereUniqueInput
    create: XOR<EmpleadoCreateWithoutObjetivoInput, EmpleadoUncheckedCreateWithoutObjetivoInput>
  }

  export type ObjetivoDetalleCreateWithoutObjetivoInput = {
    secuencial: number
    descripcion?: string | null
    descripcionIniciativa?: string | null
    unidadMedida?: string | null
    pesoEspecifico?: number | null
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type ObjetivoDetalleUncheckedCreateWithoutObjetivoInput = {
    idObjetivoDetalle?: number
    secuencial: number
    descripcion?: string | null
    descripcionIniciativa?: string | null
    unidadMedida?: string | null
    pesoEspecifico?: number | null
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type ObjetivoDetalleCreateOrConnectWithoutObjetivoInput = {
    where: ObjetivoDetalleWhereUniqueInput
    create: XOR<ObjetivoDetalleCreateWithoutObjetivoInput, ObjetivoDetalleUncheckedCreateWithoutObjetivoInput>
  }

  export type ObjetivoDetalleCreateManyObjetivoInputEnvelope = {
    data: ObjetivoDetalleCreateManyObjetivoInput | ObjetivoDetalleCreateManyObjetivoInput[]
    skipDuplicates?: boolean
  }

  export type EmpresaEmpleadoraUpsertWithoutObjetivoInput = {
    update: XOR<EmpresaEmpleadoraUpdateWithoutObjetivoInput, EmpresaEmpleadoraUncheckedUpdateWithoutObjetivoInput>
    create: XOR<EmpresaEmpleadoraCreateWithoutObjetivoInput, EmpresaEmpleadoraUncheckedCreateWithoutObjetivoInput>
    where?: EmpresaEmpleadoraWhereInput
  }

  export type EmpresaEmpleadoraUpdateToOneWithWhereWithoutObjetivoInput = {
    where?: EmpresaEmpleadoraWhereInput
    data: XOR<EmpresaEmpleadoraUpdateWithoutObjetivoInput, EmpresaEmpleadoraUncheckedUpdateWithoutObjetivoInput>
  }

  export type EmpresaEmpleadoraUpdateWithoutObjetivoInput = {
    nombreEmpresa?: StringFieldUpdateOperationsInput | string
    ruc?: NullableStringFieldUpdateOperationsInput | string | null
    direccionEmpresa?: NullableStringFieldUpdateOperationsInput | string | null
    urlLogo?: StringFieldUpdateOperationsInput | string
    fechaVigenciaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVigenciaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    equipoEmpleadora?: EquipoEmpleadoraUpdateManyWithoutEmpresaEmpleadoraNestedInput
    puestoEmpleadora?: PuestoEmpleadoraUpdateManyWithoutEmpresaEmpleadoraNestedInput
    unidadEmpleadora?: UnidadEmpleadoraUpdateManyWithoutEmpresaEmpleadoraNestedInput
    empleado?: EmpleadoUpdateManyWithoutEmpresaEmpleadoraNestedInput
  }

  export type EmpresaEmpleadoraUncheckedUpdateWithoutObjetivoInput = {
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    nombreEmpresa?: StringFieldUpdateOperationsInput | string
    ruc?: NullableStringFieldUpdateOperationsInput | string | null
    direccionEmpresa?: NullableStringFieldUpdateOperationsInput | string | null
    urlLogo?: StringFieldUpdateOperationsInput | string
    fechaVigenciaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVigenciaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    equipoEmpleadora?: EquipoEmpleadoraUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput
    puestoEmpleadora?: PuestoEmpleadoraUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput
    unidadEmpleadora?: UnidadEmpleadoraUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput
    empleado?: EmpleadoUncheckedUpdateManyWithoutEmpresaEmpleadoraNestedInput
  }

  export type EmpleadoUpsertWithoutObjetivoInput = {
    update: XOR<EmpleadoUpdateWithoutObjetivoInput, EmpleadoUncheckedUpdateWithoutObjetivoInput>
    create: XOR<EmpleadoCreateWithoutObjetivoInput, EmpleadoUncheckedCreateWithoutObjetivoInput>
    where?: EmpleadoWhereInput
  }

  export type EmpleadoUpdateToOneWithWhereWithoutObjetivoInput = {
    where?: EmpleadoWhereInput
    data: XOR<EmpleadoUpdateWithoutObjetivoInput, EmpleadoUncheckedUpdateWithoutObjetivoInput>
  }

  export type EmpleadoUpdateWithoutObjetivoInput = {
    nombres?: StringFieldUpdateOperationsInput | string
    apellidoPaterno?: StringFieldUpdateOperationsInput | string
    apellidoMaterno?: StringFieldUpdateOperationsInput | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    empresaEmpleadora?: EmpresaEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput
    equipoEmpleadora?: EquipoEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput
    puestoEmpleadora?: PuestoEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput
    unidadEmpleadora?: UnidadEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput
    usuario?: UsuarioUpdateOneRequiredWithoutEmpleadoNestedInput
  }

  export type EmpleadoUncheckedUpdateWithoutObjetivoInput = {
    idEmpleado?: IntFieldUpdateOperationsInput | number
    nombres?: StringFieldUpdateOperationsInput | string
    apellidoPaterno?: StringFieldUpdateOperationsInput | string
    apellidoMaterno?: StringFieldUpdateOperationsInput | string
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    idEquipoEmpleadora?: IntFieldUpdateOperationsInput | number
    idPuestoEmpleadora?: IntFieldUpdateOperationsInput | number
    idUnidadEmpleadora?: IntFieldUpdateOperationsInput | number
    idUsuario?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ObjetivoDetalleUpsertWithWhereUniqueWithoutObjetivoInput = {
    where: ObjetivoDetalleWhereUniqueInput
    update: XOR<ObjetivoDetalleUpdateWithoutObjetivoInput, ObjetivoDetalleUncheckedUpdateWithoutObjetivoInput>
    create: XOR<ObjetivoDetalleCreateWithoutObjetivoInput, ObjetivoDetalleUncheckedCreateWithoutObjetivoInput>
  }

  export type ObjetivoDetalleUpdateWithWhereUniqueWithoutObjetivoInput = {
    where: ObjetivoDetalleWhereUniqueInput
    data: XOR<ObjetivoDetalleUpdateWithoutObjetivoInput, ObjetivoDetalleUncheckedUpdateWithoutObjetivoInput>
  }

  export type ObjetivoDetalleUpdateManyWithWhereWithoutObjetivoInput = {
    where: ObjetivoDetalleScalarWhereInput
    data: XOR<ObjetivoDetalleUpdateManyMutationInput, ObjetivoDetalleUncheckedUpdateManyWithoutObjetivoInput>
  }

  export type ObjetivoDetalleScalarWhereInput = {
    AND?: ObjetivoDetalleScalarWhereInput | ObjetivoDetalleScalarWhereInput[]
    OR?: ObjetivoDetalleScalarWhereInput[]
    NOT?: ObjetivoDetalleScalarWhereInput | ObjetivoDetalleScalarWhereInput[]
    idObjetivoDetalle?: IntFilter<"ObjetivoDetalle"> | number
    idObjetivo?: IntFilter<"ObjetivoDetalle"> | number
    secuencial?: IntFilter<"ObjetivoDetalle"> | number
    descripcion?: StringNullableFilter<"ObjetivoDetalle"> | string | null
    descripcionIniciativa?: StringNullableFilter<"ObjetivoDetalle"> | string | null
    unidadMedida?: StringNullableFilter<"ObjetivoDetalle"> | string | null
    pesoEspecifico?: FloatNullableFilter<"ObjetivoDetalle"> | number | null
    estado?: BoolFilter<"ObjetivoDetalle"> | boolean
    creadoPorId?: IntFilter<"ObjetivoDetalle"> | number
    actualizadoPorId?: IntNullableFilter<"ObjetivoDetalle"> | number | null
    fechaCreacion?: DateTimeFilter<"ObjetivoDetalle"> | Date | string
    fechaModificacion?: DateTimeNullableFilter<"ObjetivoDetalle"> | Date | string | null
  }

  export type ObjetivoCreateWithoutObjetivoDetalleInput = {
    fechaVigenciaInicia: Date | string
    fechaVigenciaFin: Date | string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
    empresaEmpleadora: EmpresaEmpleadoraCreateNestedOneWithoutObjetivoInput
    empleado: EmpleadoCreateNestedOneWithoutObjetivoInput
  }

  export type ObjetivoUncheckedCreateWithoutObjetivoDetalleInput = {
    idObjetivo?: number
    fechaVigenciaInicia: Date | string
    fechaVigenciaFin: Date | string
    idEmpresaEmpleadora: number
    idEmpleado: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type ObjetivoCreateOrConnectWithoutObjetivoDetalleInput = {
    where: ObjetivoWhereUniqueInput
    create: XOR<ObjetivoCreateWithoutObjetivoDetalleInput, ObjetivoUncheckedCreateWithoutObjetivoDetalleInput>
  }

  export type ObjetivoUpsertWithoutObjetivoDetalleInput = {
    update: XOR<ObjetivoUpdateWithoutObjetivoDetalleInput, ObjetivoUncheckedUpdateWithoutObjetivoDetalleInput>
    create: XOR<ObjetivoCreateWithoutObjetivoDetalleInput, ObjetivoUncheckedCreateWithoutObjetivoDetalleInput>
    where?: ObjetivoWhereInput
  }

  export type ObjetivoUpdateToOneWithWhereWithoutObjetivoDetalleInput = {
    where?: ObjetivoWhereInput
    data: XOR<ObjetivoUpdateWithoutObjetivoDetalleInput, ObjetivoUncheckedUpdateWithoutObjetivoDetalleInput>
  }

  export type ObjetivoUpdateWithoutObjetivoDetalleInput = {
    fechaVigenciaInicia?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVigenciaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    empresaEmpleadora?: EmpresaEmpleadoraUpdateOneRequiredWithoutObjetivoNestedInput
    empleado?: EmpleadoUpdateOneRequiredWithoutObjetivoNestedInput
  }

  export type ObjetivoUncheckedUpdateWithoutObjetivoDetalleInput = {
    idObjetivo?: IntFieldUpdateOperationsInput | number
    fechaVigenciaInicia?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVigenciaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    idEmpleado?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TablaMaestraDetalleCreateWithoutTablaMaestraInput = {
    descripcion?: string | null
    valor?: string | null
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type TablaMaestraDetalleUncheckedCreateWithoutTablaMaestraInput = {
    idTablaMaestraDetalle?: number
    descripcion?: string | null
    valor?: string | null
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type TablaMaestraDetalleCreateOrConnectWithoutTablaMaestraInput = {
    where: TablaMaestraDetalleWhereUniqueInput
    create: XOR<TablaMaestraDetalleCreateWithoutTablaMaestraInput, TablaMaestraDetalleUncheckedCreateWithoutTablaMaestraInput>
  }

  export type TablaMaestraDetalleCreateManyTablaMaestraInputEnvelope = {
    data: TablaMaestraDetalleCreateManyTablaMaestraInput | TablaMaestraDetalleCreateManyTablaMaestraInput[]
    skipDuplicates?: boolean
  }

  export type TablaMaestraDetalleUpsertWithWhereUniqueWithoutTablaMaestraInput = {
    where: TablaMaestraDetalleWhereUniqueInput
    update: XOR<TablaMaestraDetalleUpdateWithoutTablaMaestraInput, TablaMaestraDetalleUncheckedUpdateWithoutTablaMaestraInput>
    create: XOR<TablaMaestraDetalleCreateWithoutTablaMaestraInput, TablaMaestraDetalleUncheckedCreateWithoutTablaMaestraInput>
  }

  export type TablaMaestraDetalleUpdateWithWhereUniqueWithoutTablaMaestraInput = {
    where: TablaMaestraDetalleWhereUniqueInput
    data: XOR<TablaMaestraDetalleUpdateWithoutTablaMaestraInput, TablaMaestraDetalleUncheckedUpdateWithoutTablaMaestraInput>
  }

  export type TablaMaestraDetalleUpdateManyWithWhereWithoutTablaMaestraInput = {
    where: TablaMaestraDetalleScalarWhereInput
    data: XOR<TablaMaestraDetalleUpdateManyMutationInput, TablaMaestraDetalleUncheckedUpdateManyWithoutTablaMaestraInput>
  }

  export type TablaMaestraDetalleScalarWhereInput = {
    AND?: TablaMaestraDetalleScalarWhereInput | TablaMaestraDetalleScalarWhereInput[]
    OR?: TablaMaestraDetalleScalarWhereInput[]
    NOT?: TablaMaestraDetalleScalarWhereInput | TablaMaestraDetalleScalarWhereInput[]
    idTablaMaestraDetalle?: IntFilter<"TablaMaestraDetalle"> | number
    descripcion?: StringNullableFilter<"TablaMaestraDetalle"> | string | null
    valor?: StringNullableFilter<"TablaMaestraDetalle"> | string | null
    idTablaMaestra?: IntFilter<"TablaMaestraDetalle"> | number
    estado?: BoolFilter<"TablaMaestraDetalle"> | boolean
    creadoPorId?: IntFilter<"TablaMaestraDetalle"> | number
    actualizadoPorId?: IntNullableFilter<"TablaMaestraDetalle"> | number | null
    fechaCreacion?: DateTimeFilter<"TablaMaestraDetalle"> | Date | string
    fechaModificacion?: DateTimeNullableFilter<"TablaMaestraDetalle"> | Date | string | null
  }

  export type TablaMaestraCreateWithoutTablaMaestraDetalleInput = {
    descripcion?: string | null
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type TablaMaestraUncheckedCreateWithoutTablaMaestraDetalleInput = {
    idTablaMaestra?: number
    descripcion?: string | null
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type TablaMaestraCreateOrConnectWithoutTablaMaestraDetalleInput = {
    where: TablaMaestraWhereUniqueInput
    create: XOR<TablaMaestraCreateWithoutTablaMaestraDetalleInput, TablaMaestraUncheckedCreateWithoutTablaMaestraDetalleInput>
  }

  export type TablaMaestraUpsertWithoutTablaMaestraDetalleInput = {
    update: XOR<TablaMaestraUpdateWithoutTablaMaestraDetalleInput, TablaMaestraUncheckedUpdateWithoutTablaMaestraDetalleInput>
    create: XOR<TablaMaestraCreateWithoutTablaMaestraDetalleInput, TablaMaestraUncheckedCreateWithoutTablaMaestraDetalleInput>
    where?: TablaMaestraWhereInput
  }

  export type TablaMaestraUpdateToOneWithWhereWithoutTablaMaestraDetalleInput = {
    where?: TablaMaestraWhereInput
    data: XOR<TablaMaestraUpdateWithoutTablaMaestraDetalleInput, TablaMaestraUncheckedUpdateWithoutTablaMaestraDetalleInput>
  }

  export type TablaMaestraUpdateWithoutTablaMaestraDetalleInput = {
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TablaMaestraUncheckedUpdateWithoutTablaMaestraDetalleInput = {
    idTablaMaestra?: IntFieldUpdateOperationsInput | number
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ObjetivoCreateManyEmpleadoInput = {
    idObjetivo?: number
    fechaVigenciaInicia: Date | string
    fechaVigenciaFin: Date | string
    idEmpresaEmpleadora: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type ObjetivoUpdateWithoutEmpleadoInput = {
    fechaVigenciaInicia?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVigenciaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    empresaEmpleadora?: EmpresaEmpleadoraUpdateOneRequiredWithoutObjetivoNestedInput
    ObjetivoDetalle?: ObjetivoDetalleUpdateManyWithoutObjetivoNestedInput
  }

  export type ObjetivoUncheckedUpdateWithoutEmpleadoInput = {
    idObjetivo?: IntFieldUpdateOperationsInput | number
    fechaVigenciaInicia?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVigenciaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ObjetivoDetalle?: ObjetivoDetalleUncheckedUpdateManyWithoutObjetivoNestedInput
  }

  export type ObjetivoUncheckedUpdateManyWithoutEmpleadoInput = {
    idObjetivo?: IntFieldUpdateOperationsInput | number
    fechaVigenciaInicia?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVigenciaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type EmpleadoCreateManyUsuarioInput = {
    idEmpleado?: number
    nombres: string
    apellidoPaterno: string
    apellidoMaterno: string
    idEmpresaEmpleadora: number
    idEquipoEmpleadora: number
    idPuestoEmpleadora: number
    idUnidadEmpleadora: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type EmpleadoUpdateWithoutUsuarioInput = {
    nombres?: StringFieldUpdateOperationsInput | string
    apellidoPaterno?: StringFieldUpdateOperationsInput | string
    apellidoMaterno?: StringFieldUpdateOperationsInput | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    empresaEmpleadora?: EmpresaEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput
    equipoEmpleadora?: EquipoEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput
    puestoEmpleadora?: PuestoEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput
    unidadEmpleadora?: UnidadEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput
    objetivo?: ObjetivoUpdateManyWithoutEmpleadoNestedInput
  }

  export type EmpleadoUncheckedUpdateWithoutUsuarioInput = {
    idEmpleado?: IntFieldUpdateOperationsInput | number
    nombres?: StringFieldUpdateOperationsInput | string
    apellidoPaterno?: StringFieldUpdateOperationsInput | string
    apellidoMaterno?: StringFieldUpdateOperationsInput | string
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    idEquipoEmpleadora?: IntFieldUpdateOperationsInput | number
    idPuestoEmpleadora?: IntFieldUpdateOperationsInput | number
    idUnidadEmpleadora?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    objetivo?: ObjetivoUncheckedUpdateManyWithoutEmpleadoNestedInput
  }

  export type EmpleadoUncheckedUpdateManyWithoutUsuarioInput = {
    idEmpleado?: IntFieldUpdateOperationsInput | number
    nombres?: StringFieldUpdateOperationsInput | string
    apellidoPaterno?: StringFieldUpdateOperationsInput | string
    apellidoMaterno?: StringFieldUpdateOperationsInput | string
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    idEquipoEmpleadora?: IntFieldUpdateOperationsInput | number
    idPuestoEmpleadora?: IntFieldUpdateOperationsInput | number
    idUnidadEmpleadora?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type EquipoEmpleadoraCreateManyEmpresaEmpleadoraInput = {
    idEquipoEmpleadora?: number
    descripcion: string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type PuestoEmpleadoraCreateManyEmpresaEmpleadoraInput = {
    idPuestoEmpleadora?: number
    descripcion: string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type UnidadEmpleadoraCreateManyEmpresaEmpleadoraInput = {
    idUnidadEmpleadora?: number
    descripcion: string
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type ObjetivoCreateManyEmpresaEmpleadoraInput = {
    idObjetivo?: number
    fechaVigenciaInicia: Date | string
    fechaVigenciaFin: Date | string
    idEmpleado: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type EmpleadoCreateManyEmpresaEmpleadoraInput = {
    idEmpleado?: number
    nombres: string
    apellidoPaterno: string
    apellidoMaterno: string
    idEquipoEmpleadora: number
    idPuestoEmpleadora: number
    idUnidadEmpleadora: number
    idUsuario: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type EquipoEmpleadoraUpdateWithoutEmpresaEmpleadoraInput = {
    descripcion?: StringFieldUpdateOperationsInput | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Empleado?: EmpleadoUpdateManyWithoutEquipoEmpleadoraNestedInput
  }

  export type EquipoEmpleadoraUncheckedUpdateWithoutEmpresaEmpleadoraInput = {
    idEquipoEmpleadora?: IntFieldUpdateOperationsInput | number
    descripcion?: StringFieldUpdateOperationsInput | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Empleado?: EmpleadoUncheckedUpdateManyWithoutEquipoEmpleadoraNestedInput
  }

  export type EquipoEmpleadoraUncheckedUpdateManyWithoutEmpresaEmpleadoraInput = {
    idEquipoEmpleadora?: IntFieldUpdateOperationsInput | number
    descripcion?: StringFieldUpdateOperationsInput | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PuestoEmpleadoraUpdateWithoutEmpresaEmpleadoraInput = {
    descripcion?: StringFieldUpdateOperationsInput | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Empleado?: EmpleadoUpdateManyWithoutPuestoEmpleadoraNestedInput
  }

  export type PuestoEmpleadoraUncheckedUpdateWithoutEmpresaEmpleadoraInput = {
    idPuestoEmpleadora?: IntFieldUpdateOperationsInput | number
    descripcion?: StringFieldUpdateOperationsInput | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Empleado?: EmpleadoUncheckedUpdateManyWithoutPuestoEmpleadoraNestedInput
  }

  export type PuestoEmpleadoraUncheckedUpdateManyWithoutEmpresaEmpleadoraInput = {
    idPuestoEmpleadora?: IntFieldUpdateOperationsInput | number
    descripcion?: StringFieldUpdateOperationsInput | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UnidadEmpleadoraUpdateWithoutEmpresaEmpleadoraInput = {
    descripcion?: StringFieldUpdateOperationsInput | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    empleado?: EmpleadoUpdateManyWithoutUnidadEmpleadoraNestedInput
  }

  export type UnidadEmpleadoraUncheckedUpdateWithoutEmpresaEmpleadoraInput = {
    idUnidadEmpleadora?: IntFieldUpdateOperationsInput | number
    descripcion?: StringFieldUpdateOperationsInput | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    empleado?: EmpleadoUncheckedUpdateManyWithoutUnidadEmpleadoraNestedInput
  }

  export type UnidadEmpleadoraUncheckedUpdateManyWithoutEmpresaEmpleadoraInput = {
    idUnidadEmpleadora?: IntFieldUpdateOperationsInput | number
    descripcion?: StringFieldUpdateOperationsInput | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ObjetivoUpdateWithoutEmpresaEmpleadoraInput = {
    fechaVigenciaInicia?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVigenciaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    empleado?: EmpleadoUpdateOneRequiredWithoutObjetivoNestedInput
    ObjetivoDetalle?: ObjetivoDetalleUpdateManyWithoutObjetivoNestedInput
  }

  export type ObjetivoUncheckedUpdateWithoutEmpresaEmpleadoraInput = {
    idObjetivo?: IntFieldUpdateOperationsInput | number
    fechaVigenciaInicia?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVigenciaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    idEmpleado?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ObjetivoDetalle?: ObjetivoDetalleUncheckedUpdateManyWithoutObjetivoNestedInput
  }

  export type ObjetivoUncheckedUpdateManyWithoutEmpresaEmpleadoraInput = {
    idObjetivo?: IntFieldUpdateOperationsInput | number
    fechaVigenciaInicia?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVigenciaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    idEmpleado?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type EmpleadoUpdateWithoutEmpresaEmpleadoraInput = {
    nombres?: StringFieldUpdateOperationsInput | string
    apellidoPaterno?: StringFieldUpdateOperationsInput | string
    apellidoMaterno?: StringFieldUpdateOperationsInput | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    equipoEmpleadora?: EquipoEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput
    puestoEmpleadora?: PuestoEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput
    unidadEmpleadora?: UnidadEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput
    usuario?: UsuarioUpdateOneRequiredWithoutEmpleadoNestedInput
    objetivo?: ObjetivoUpdateManyWithoutEmpleadoNestedInput
  }

  export type EmpleadoUncheckedUpdateWithoutEmpresaEmpleadoraInput = {
    idEmpleado?: IntFieldUpdateOperationsInput | number
    nombres?: StringFieldUpdateOperationsInput | string
    apellidoPaterno?: StringFieldUpdateOperationsInput | string
    apellidoMaterno?: StringFieldUpdateOperationsInput | string
    idEquipoEmpleadora?: IntFieldUpdateOperationsInput | number
    idPuestoEmpleadora?: IntFieldUpdateOperationsInput | number
    idUnidadEmpleadora?: IntFieldUpdateOperationsInput | number
    idUsuario?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    objetivo?: ObjetivoUncheckedUpdateManyWithoutEmpleadoNestedInput
  }

  export type EmpleadoUncheckedUpdateManyWithoutEmpresaEmpleadoraInput = {
    idEmpleado?: IntFieldUpdateOperationsInput | number
    nombres?: StringFieldUpdateOperationsInput | string
    apellidoPaterno?: StringFieldUpdateOperationsInput | string
    apellidoMaterno?: StringFieldUpdateOperationsInput | string
    idEquipoEmpleadora?: IntFieldUpdateOperationsInput | number
    idPuestoEmpleadora?: IntFieldUpdateOperationsInput | number
    idUnidadEmpleadora?: IntFieldUpdateOperationsInput | number
    idUsuario?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type EmpleadoCreateManyEquipoEmpleadoraInput = {
    idEmpleado?: number
    nombres: string
    apellidoPaterno: string
    apellidoMaterno: string
    idEmpresaEmpleadora: number
    idPuestoEmpleadora: number
    idUnidadEmpleadora: number
    idUsuario: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type EmpleadoUpdateWithoutEquipoEmpleadoraInput = {
    nombres?: StringFieldUpdateOperationsInput | string
    apellidoPaterno?: StringFieldUpdateOperationsInput | string
    apellidoMaterno?: StringFieldUpdateOperationsInput | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    empresaEmpleadora?: EmpresaEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput
    puestoEmpleadora?: PuestoEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput
    unidadEmpleadora?: UnidadEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput
    usuario?: UsuarioUpdateOneRequiredWithoutEmpleadoNestedInput
    objetivo?: ObjetivoUpdateManyWithoutEmpleadoNestedInput
  }

  export type EmpleadoUncheckedUpdateWithoutEquipoEmpleadoraInput = {
    idEmpleado?: IntFieldUpdateOperationsInput | number
    nombres?: StringFieldUpdateOperationsInput | string
    apellidoPaterno?: StringFieldUpdateOperationsInput | string
    apellidoMaterno?: StringFieldUpdateOperationsInput | string
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    idPuestoEmpleadora?: IntFieldUpdateOperationsInput | number
    idUnidadEmpleadora?: IntFieldUpdateOperationsInput | number
    idUsuario?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    objetivo?: ObjetivoUncheckedUpdateManyWithoutEmpleadoNestedInput
  }

  export type EmpleadoUncheckedUpdateManyWithoutEquipoEmpleadoraInput = {
    idEmpleado?: IntFieldUpdateOperationsInput | number
    nombres?: StringFieldUpdateOperationsInput | string
    apellidoPaterno?: StringFieldUpdateOperationsInput | string
    apellidoMaterno?: StringFieldUpdateOperationsInput | string
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    idPuestoEmpleadora?: IntFieldUpdateOperationsInput | number
    idUnidadEmpleadora?: IntFieldUpdateOperationsInput | number
    idUsuario?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type EmpleadoCreateManyPuestoEmpleadoraInput = {
    idEmpleado?: number
    nombres: string
    apellidoPaterno: string
    apellidoMaterno: string
    idEmpresaEmpleadora: number
    idEquipoEmpleadora: number
    idUnidadEmpleadora: number
    idUsuario: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type EmpleadoUpdateWithoutPuestoEmpleadoraInput = {
    nombres?: StringFieldUpdateOperationsInput | string
    apellidoPaterno?: StringFieldUpdateOperationsInput | string
    apellidoMaterno?: StringFieldUpdateOperationsInput | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    empresaEmpleadora?: EmpresaEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput
    equipoEmpleadora?: EquipoEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput
    unidadEmpleadora?: UnidadEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput
    usuario?: UsuarioUpdateOneRequiredWithoutEmpleadoNestedInput
    objetivo?: ObjetivoUpdateManyWithoutEmpleadoNestedInput
  }

  export type EmpleadoUncheckedUpdateWithoutPuestoEmpleadoraInput = {
    idEmpleado?: IntFieldUpdateOperationsInput | number
    nombres?: StringFieldUpdateOperationsInput | string
    apellidoPaterno?: StringFieldUpdateOperationsInput | string
    apellidoMaterno?: StringFieldUpdateOperationsInput | string
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    idEquipoEmpleadora?: IntFieldUpdateOperationsInput | number
    idUnidadEmpleadora?: IntFieldUpdateOperationsInput | number
    idUsuario?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    objetivo?: ObjetivoUncheckedUpdateManyWithoutEmpleadoNestedInput
  }

  export type EmpleadoUncheckedUpdateManyWithoutPuestoEmpleadoraInput = {
    idEmpleado?: IntFieldUpdateOperationsInput | number
    nombres?: StringFieldUpdateOperationsInput | string
    apellidoPaterno?: StringFieldUpdateOperationsInput | string
    apellidoMaterno?: StringFieldUpdateOperationsInput | string
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    idEquipoEmpleadora?: IntFieldUpdateOperationsInput | number
    idUnidadEmpleadora?: IntFieldUpdateOperationsInput | number
    idUsuario?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type EmpleadoCreateManyUnidadEmpleadoraInput = {
    idEmpleado?: number
    nombres: string
    apellidoPaterno: string
    apellidoMaterno: string
    idEmpresaEmpleadora: number
    idEquipoEmpleadora: number
    idPuestoEmpleadora: number
    idUsuario: number
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type EmpleadoUpdateWithoutUnidadEmpleadoraInput = {
    nombres?: StringFieldUpdateOperationsInput | string
    apellidoPaterno?: StringFieldUpdateOperationsInput | string
    apellidoMaterno?: StringFieldUpdateOperationsInput | string
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    empresaEmpleadora?: EmpresaEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput
    equipoEmpleadora?: EquipoEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput
    puestoEmpleadora?: PuestoEmpleadoraUpdateOneRequiredWithoutEmpleadoNestedInput
    usuario?: UsuarioUpdateOneRequiredWithoutEmpleadoNestedInput
    objetivo?: ObjetivoUpdateManyWithoutEmpleadoNestedInput
  }

  export type EmpleadoUncheckedUpdateWithoutUnidadEmpleadoraInput = {
    idEmpleado?: IntFieldUpdateOperationsInput | number
    nombres?: StringFieldUpdateOperationsInput | string
    apellidoPaterno?: StringFieldUpdateOperationsInput | string
    apellidoMaterno?: StringFieldUpdateOperationsInput | string
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    idEquipoEmpleadora?: IntFieldUpdateOperationsInput | number
    idPuestoEmpleadora?: IntFieldUpdateOperationsInput | number
    idUsuario?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    objetivo?: ObjetivoUncheckedUpdateManyWithoutEmpleadoNestedInput
  }

  export type EmpleadoUncheckedUpdateManyWithoutUnidadEmpleadoraInput = {
    idEmpleado?: IntFieldUpdateOperationsInput | number
    nombres?: StringFieldUpdateOperationsInput | string
    apellidoPaterno?: StringFieldUpdateOperationsInput | string
    apellidoMaterno?: StringFieldUpdateOperationsInput | string
    idEmpresaEmpleadora?: IntFieldUpdateOperationsInput | number
    idEquipoEmpleadora?: IntFieldUpdateOperationsInput | number
    idPuestoEmpleadora?: IntFieldUpdateOperationsInput | number
    idUsuario?: IntFieldUpdateOperationsInput | number
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ObjetivoDetalleCreateManyObjetivoInput = {
    idObjetivoDetalle?: number
    secuencial: number
    descripcion?: string | null
    descripcionIniciativa?: string | null
    unidadMedida?: string | null
    pesoEspecifico?: number | null
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type ObjetivoDetalleUpdateWithoutObjetivoInput = {
    secuencial?: IntFieldUpdateOperationsInput | number
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    descripcionIniciativa?: NullableStringFieldUpdateOperationsInput | string | null
    unidadMedida?: NullableStringFieldUpdateOperationsInput | string | null
    pesoEspecifico?: NullableFloatFieldUpdateOperationsInput | number | null
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ObjetivoDetalleUncheckedUpdateWithoutObjetivoInput = {
    idObjetivoDetalle?: IntFieldUpdateOperationsInput | number
    secuencial?: IntFieldUpdateOperationsInput | number
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    descripcionIniciativa?: NullableStringFieldUpdateOperationsInput | string | null
    unidadMedida?: NullableStringFieldUpdateOperationsInput | string | null
    pesoEspecifico?: NullableFloatFieldUpdateOperationsInput | number | null
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ObjetivoDetalleUncheckedUpdateManyWithoutObjetivoInput = {
    idObjetivoDetalle?: IntFieldUpdateOperationsInput | number
    secuencial?: IntFieldUpdateOperationsInput | number
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    descripcionIniciativa?: NullableStringFieldUpdateOperationsInput | string | null
    unidadMedida?: NullableStringFieldUpdateOperationsInput | string | null
    pesoEspecifico?: NullableFloatFieldUpdateOperationsInput | number | null
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TablaMaestraDetalleCreateManyTablaMaestraInput = {
    idTablaMaestraDetalle?: number
    descripcion?: string | null
    valor?: string | null
    estado?: boolean
    creadoPorId: number
    actualizadoPorId?: number | null
    fechaCreacion?: Date | string
    fechaModificacion?: Date | string | null
  }

  export type TablaMaestraDetalleUpdateWithoutTablaMaestraInput = {
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    valor?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TablaMaestraDetalleUncheckedUpdateWithoutTablaMaestraInput = {
    idTablaMaestraDetalle?: IntFieldUpdateOperationsInput | number
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    valor?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TablaMaestraDetalleUncheckedUpdateManyWithoutTablaMaestraInput = {
    idTablaMaestraDetalle?: IntFieldUpdateOperationsInput | number
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    valor?: NullableStringFieldUpdateOperationsInput | string | null
    estado?: BoolFieldUpdateOperationsInput | boolean
    creadoPorId?: IntFieldUpdateOperationsInput | number
    actualizadoPorId?: NullableIntFieldUpdateOperationsInput | number | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaModificacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}