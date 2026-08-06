-- CreateEnum
CREATE TYPE "WidgetButtonContentType" AS ENUM ('TEXT', 'ICON');

-- AlterTable
ALTER TABLE "web_widget_integrations" ADD COLUMN     "button_color" TEXT NOT NULL DEFAULT '#FF9521',
ADD COLUMN     "button_content_type" "WidgetButtonContentType" NOT NULL DEFAULT 'TEXT',
ADD COLUMN     "button_icon" TEXT;
