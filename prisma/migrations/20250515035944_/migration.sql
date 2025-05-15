-- CreateTable
CREATE TABLE "roles" (
    "rol_id" SERIAL NOT NULL,
    "name" TEXT,
    "is_deleted" BOOLEAN DEFAULT false,
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("rol_id")
);

-- CreateTable
CREATE TABLE "employees" (
    "employee_id" SERIAL NOT NULL,
    "first_names" TEXT,
    "last_names" TEXT,
    "is_deleted" BOOLEAN DEFAULT false,
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("employee_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "user_code" TEXT,
    "email" TEXT,
    "password" TEXT,
    "rol_id" INTEGER NOT NULL,
    "is_deleted" BOOLEAN DEFAULT false,
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "employer_companies" (
    "employer_company_id" SERIAL NOT NULL,
    "name" TEXT,
    "address" TEXT,
    "logo_url" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN DEFAULT false,
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employer_companies_pkey" PRIMARY KEY ("employer_company_id")
);

-- CreateTable
CREATE TABLE "employer_teams" (
    "employer_team_id" SERIAL NOT NULL,
    "name" TEXT,
    "employer_company_id" INTEGER NOT NULL,
    "is_deleted" BOOLEAN DEFAULT false,
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employer_teams_pkey" PRIMARY KEY ("employer_team_id")
);

-- CreateTable
CREATE TABLE "employer_positions" (
    "employer_position_id" SERIAL NOT NULL,
    "name" TEXT,
    "employer_company_id" INTEGER NOT NULL,
    "is_deleted" BOOLEAN DEFAULT false,
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employer_positions_pkey" PRIMARY KEY ("employer_position_id")
);

-- CreateTable
CREATE TABLE "employer_units" (
    "employer_unit_id" SERIAL NOT NULL,
    "name" TEXT,
    "employer_company_id" INTEGER NOT NULL,
    "is_deleted" BOOLEAN DEFAULT false,
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employer_units_pkey" PRIMARY KEY ("employer_unit_id")
);

-- CreateTable
CREATE TABLE "goals" (
    "goal_id" SERIAL NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "is_deleted" BOOLEAN DEFAULT false,
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("goal_id")
);

-- CreateTable
CREATE TABLE "goal_details" (
    "goal_detail_id" SERIAL NOT NULL,
    "sequential" INTEGER NOT NULL,
    "description" TEXT,
    "initiative_description" TEXT,
    "unit_measure" TEXT,
    "specific_weight" DOUBLE PRECISION,
    "goal_id" INTEGER NOT NULL,
    "is_deleted" BOOLEAN DEFAULT false,
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goal_details_pkey" PRIMARY KEY ("goal_detail_id")
);

-- CreateTable
CREATE TABLE "master_tables" (
    "master_table_id" SERIAL NOT NULL,
    "description" TEXT,
    "is_deleted" BOOLEAN DEFAULT false,
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_tables_pkey" PRIMARY KEY ("master_table_id")
);

-- CreateTable
CREATE TABLE "master_table_details" (
    "master_table_detail_id" SERIAL NOT NULL,
    "description" TEXT,
    "value" TEXT,
    "master_table_id" INTEGER NOT NULL,
    "is_deleted" BOOLEAN DEFAULT false,
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_table_details_pkey" PRIMARY KEY ("master_table_detail_id")
);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("rol_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employer_teams" ADD CONSTRAINT "employer_teams_employer_company_id_fkey" FOREIGN KEY ("employer_company_id") REFERENCES "employer_companies"("employer_company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employer_positions" ADD CONSTRAINT "employer_positions_employer_company_id_fkey" FOREIGN KEY ("employer_company_id") REFERENCES "employer_companies"("employer_company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employer_units" ADD CONSTRAINT "employer_units_employer_company_id_fkey" FOREIGN KEY ("employer_company_id") REFERENCES "employer_companies"("employer_company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_details" ADD CONSTRAINT "goal_details_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goals"("goal_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_table_details" ADD CONSTRAINT "master_table_details_master_table_id_fkey" FOREIGN KEY ("master_table_id") REFERENCES "master_tables"("master_table_id") ON DELETE RESTRICT ON UPDATE CASCADE;
