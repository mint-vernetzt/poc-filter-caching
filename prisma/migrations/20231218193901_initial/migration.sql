-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subline" TEXT,
    "headline" TEXT,
    "excerpt" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "city" TEXT,
    "further_formats" TEXT[],
    "further_disciplines" TEXT[],

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disciplines" (
    "id" TEXT NOT NULL,
    "referenceId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "disciplines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "additional_disciplines" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "additional_disciplines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formats_of_projects" (
    "format_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "formats_of_projects_pkey" PRIMARY KEY ("format_id","project_id")
);

-- CreateTable
CREATE TABLE "disciplines_of_projects" (
    "discipline_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disciplines_of_projects_pkey" PRIMARY KEY ("discipline_id","project_id")
);

-- CreateTable
CREATE TABLE "additional_disciplines_of_projects" (
    "additional_discipline_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "additional_disciplines_of_projects_pkey" PRIMARY KEY ("additional_discipline_id","project_id")
);

-- CreateTable
CREATE TABLE "formats" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "formats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "disciplines_referenceId_key" ON "disciplines"("referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "disciplines_title_key" ON "disciplines"("title");

-- CreateIndex
CREATE UNIQUE INDEX "disciplines_slug_key" ON "disciplines"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "additional_disciplines_title_key" ON "additional_disciplines"("title");

-- CreateIndex
CREATE UNIQUE INDEX "additional_disciplines_slug_key" ON "additional_disciplines"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "formats_title_key" ON "formats"("title");

-- AddForeignKey
ALTER TABLE "formats_of_projects" ADD CONSTRAINT "formats_of_projects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formats_of_projects" ADD CONSTRAINT "formats_of_projects_format_id_fkey" FOREIGN KEY ("format_id") REFERENCES "formats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disciplines_of_projects" ADD CONSTRAINT "disciplines_of_projects_discipline_id_fkey" FOREIGN KEY ("discipline_id") REFERENCES "disciplines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disciplines_of_projects" ADD CONSTRAINT "disciplines_of_projects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_disciplines_of_projects" ADD CONSTRAINT "additional_disciplines_of_projects_additional_discipline_i_fkey" FOREIGN KEY ("additional_discipline_id") REFERENCES "additional_disciplines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_disciplines_of_projects" ADD CONSTRAINT "additional_disciplines_of_projects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
