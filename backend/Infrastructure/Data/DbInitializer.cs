using System;
using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HotelManagementSystem.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext dbContext, ILogger logger, string contentRootPath = null)
        {
            // 1. Ensure database and core schema exist
            dbContext.Database.EnsureCreated();

            // 2. Safe PostgreSQL schema migrations and missing columns / tables check
            ApplySchemaPatches(dbContext, logger);

            // 3. Execute modular initializers in proper dependency order
            RolePermissionSeeder.Seed(dbContext, logger);
            MenuMasterSeeder.Seed(dbContext, logger);
            UserSeeder.Seed(dbContext, logger);
            RoomSeeder.Seed(dbContext, logger);
            MenuSeeder.Seed(dbContext, logger);

            logger.LogInformation("PostgreSQL Database initialized and all business data synchronized successfully.");
        }

        private static void ApplySchemaPatches(ApplicationDbContext dbContext, ILogger logger)
        {
            try
            {
                // Safely add missing columns if they do not exist in PostgreSQL
                dbContext.Database.ExecuteSqlRaw("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);");
                dbContext.Database.ExecuteSqlRaw("ALTER TABLE users ADD COLUMN IF NOT EXISTS resettoken VARCHAR(255);");
                dbContext.Database.ExecuteSqlRaw("ALTER TABLE users ADD COLUMN IF NOT EXISTS resettokenexpiry timestamp without time zone;");
                try { dbContext.Database.ExecuteSqlRaw("ALTER TABLE users ADD COLUMN IF NOT EXISTS \"IsActive\" BOOLEAN NOT NULL DEFAULT true;"); } catch { }
                try { dbContext.Database.ExecuteSqlRaw("ALTER TABLE users ALTER COLUMN \"IsActive\" SET DEFAULT true;"); } catch { }
                
                dbContext.Database.ExecuteSqlRaw("ALTER TABLE rooms ADD COLUMN IF NOT EXISTS capacity INTEGER NOT NULL DEFAULT 2;");
                dbContext.Database.ExecuteSqlRaw("ALTER TABLE rooms ADD COLUMN IF NOT EXISTS subtype VARCHAR(255);");
                dbContext.Database.ExecuteSqlRaw("ALTER TABLE rooms ADD COLUMN IF NOT EXISTS images TEXT;");
                dbContext.Database.ExecuteSqlRaw("ALTER TABLE rooms ADD COLUMN IF NOT EXISTS facility1 VARCHAR(255) DEFAULT 'High-Speed Wi-Fi 6';");
                dbContext.Database.ExecuteSqlRaw("ALTER TABLE rooms ADD COLUMN IF NOT EXISTS facility2 VARCHAR(255) DEFAULT '55\" 4K Smart TV';");
                dbContext.Database.ExecuteSqlRaw("ALTER TABLE rooms ADD COLUMN IF NOT EXISTS facility3 VARCHAR(255) DEFAULT 'Climate Air Conditioning';");
                dbContext.Database.ExecuteSqlRaw("ALTER TABLE rooms ADD COLUMN IF NOT EXISTS facility4 VARCHAR(255) DEFAULT '24/7 Room Service';");
                dbContext.Database.ExecuteSqlRaw("ALTER TABLE rooms ADD COLUMN IF NOT EXISTS facility5 VARCHAR(255) DEFAULT 'Valet & Monitored Parking';");
                try { dbContext.Database.ExecuteSqlRaw("ALTER TABLE rooms ADD COLUMN IF NOT EXISTS \"IsDeleted\" BOOLEAN NOT NULL DEFAULT false;"); } catch { }
                try { dbContext.Database.ExecuteSqlRaw("ALTER TABLE rooms ALTER COLUMN \"IsDeleted\" SET DEFAULT false;"); } catch { }
                
                dbContext.Database.ExecuteSqlRaw("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS package VARCHAR(100) DEFAULT 'Stay';");
                dbContext.Database.ExecuteSqlRaw("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paymentstatus VARCHAR(50) DEFAULT 'Pending';");
                dbContext.Database.ExecuteSqlRaw("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS transactionid VARCHAR(255);");

                dbContext.Database.ExecuteSqlRaw(@"
                    CREATE TABLE IF NOT EXISTS feedbacks (
                        id SERIAL PRIMARY KEY,
                        userid INTEGER,
                        guestname VARCHAR(255),
                        guestemail VARCHAR(255),
                        roomrating INTEGER NOT NULL DEFAULT 5,
                        foodrating INTEGER NOT NULL DEFAULT 5,
                        facilitiesrating INTEGER NOT NULL DEFAULT 5,
                        servicerating INTEGER NOT NULL DEFAULT 5,
                        averagerating DOUBLE PRECISION NOT NULL DEFAULT 5.0,
                        comments TEXT,
                        createdat TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
                    );
                ");

                dbContext.Database.ExecuteSqlRaw(@"
                    CREATE TABLE IF NOT EXISTS roles (
                        ""RoleId"" SERIAL PRIMARY KEY,
                        ""Name"" VARCHAR(100) NOT NULL UNIQUE,
                        ""Description"" TEXT,
                        ""CreatedAt"" TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
                    );
                    CREATE TABLE IF NOT EXISTS permissions (
                        ""PermissionId"" SERIAL PRIMARY KEY,
                        ""Name"" VARCHAR(100) NOT NULL UNIQUE,
                        ""Category"" VARCHAR(100) NOT NULL,
                        ""Description"" TEXT
                    );
                    CREATE TABLE IF NOT EXISTS role_permissions (
                        ""RoleId"" INTEGER NOT NULL REFERENCES roles(""RoleId"") ON DELETE CASCADE,
                        ""PermissionId"" INTEGER NOT NULL REFERENCES permissions(""PermissionId"") ON DELETE CASCADE,
                        PRIMARY KEY (""RoleId"", ""PermissionId"")
                    );
                ");

                dbContext.Database.ExecuteSqlRaw(@"
                    CREATE TABLE IF NOT EXISTS menu_items (
                        ""Id"" SERIAL PRIMARY KEY, 
                        ""Name"" VARCHAR(255) NOT NULL, 
                        ""Category"" VARCHAR(100) NOT NULL, 
                        ""Price"" DOUBLE PRECISION NOT NULL, 
                        ""DietType"" VARCHAR(100), 
                        ""Tag"" VARCHAR(100), 
                        ""Description"" TEXT, 
                        ""ImageUrl"" TEXT, 
                        ""IsDeleted"" BOOLEAN DEFAULT FALSE, 
                        ""CreatedAt"" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
                    );

                    CREATE TABLE IF NOT EXISTS menus (
                        ""Id"" SERIAL PRIMARY KEY,
                        ""Name"" VARCHAR(100) NOT NULL UNIQUE,
                        ""DisplayName"" VARCHAR(150) NOT NULL,
                        ""Route"" VARCHAR(255) NOT NULL,
                        ""Icon"" VARCHAR(100),
                        ""ParentId"" INTEGER REFERENCES menus(""Id"") ON DELETE RESTRICT,
                        ""Module"" VARCHAR(100) NOT NULL,
                        ""DisplayOrder"" INTEGER NOT NULL DEFAULT 0,
                        ""IsActive"" BOOLEAN NOT NULL DEFAULT TRUE
                    );

                    CREATE TABLE IF NOT EXISTS role_menus (
                        ""RoleId"" INTEGER NOT NULL REFERENCES roles(""RoleId"") ON DELETE CASCADE,
                        ""MenuId"" INTEGER NOT NULL REFERENCES menus(""Id"") ON DELETE CASCADE,
                        ""CanView"" BOOLEAN NOT NULL DEFAULT TRUE,
                        PRIMARY KEY (""RoleId"", ""MenuId"")
                    );

                    CREATE INDEX IF NOT EXISTS ix_role_menus_menu_id ON role_menus (""MenuId"");
                    CREATE INDEX IF NOT EXISTS ix_role_permissions_permission_id ON role_permissions (""PermissionId"");

                    DELETE FROM menus WHERE ""Name"" = 'Permissions';
                ");
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Schema patch check encountered a non-fatal notice: {Message}", ex.Message);
            }
        }
    }
}
