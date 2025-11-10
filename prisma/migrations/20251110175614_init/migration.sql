BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[IC_Users] (
    [id] INT NOT NULL IDENTITY(1,1),
    [username] NVARCHAR(100) NOT NULL,
    [password_hash] NVARCHAR(200) NOT NULL,
    [role] NVARCHAR(50) NOT NULL CONSTRAINT [DF__IC_Users__role__70DDC3D8] DEFAULT 'user',
    [created_at] DATETIME2 CONSTRAINT [DF__IC_Users__create__71D1E811] DEFAULT sysutcdatetime(),
    [email] NVARCHAR(200) NOT NULL CONSTRAINT [DF__IC_Users__email__75A278F5] DEFAULT '',
    [is_active] BIT NOT NULL CONSTRAINT [DF__IC_Users__is_act__76969D2E] DEFAULT 1,
    [updated_at] DATETIME2 CONSTRAINT [DF__IC_Users__update__778AC167] DEFAULT sysutcdatetime(),
    CONSTRAINT [PK__IC_Users__3213E83F3650DF97] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UQ__IC_Users__F3DBC5723100E9EF] UNIQUE NONCLUSTERED ([username]),
    CONSTRAINT [IC_Users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[IC_Logs] (
    [id] INT NOT NULL IDENTITY(1,1),
    [user] NVARCHAR(100) NOT NULL,
    [folio_interno] NVARCHAR(150) NOT NULL,
    [action] NVARCHAR(200) NOT NULL,
    [details] NVARCHAR(max),
    [created_at] DATETIME2 CONSTRAINT [IC_Logs_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [cliente] NVARCHAR(200),
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [IC_Logs_status_df] DEFAULT 'PENDIENTE',
    [cliente_code] NVARCHAR(50),
    [updated_by] NVARCHAR(100),
    [updated_at] DATETIME2,
    CONSTRAINT [PK__IC_Logs__3213E83FB9DAC845] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[IC_Codes] (
    [id] INT NOT NULL IDENTITY(1,1),
    [log_id] INT NOT NULL,
    [producto] NVARCHAR(100) NOT NULL,
    [codigo_ic] NVARCHAR(100) NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [IC_Codes_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PK__IC_Codes__3213E83F1CAF7DE9] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_IC_Logs_status] ON [dbo].[IC_Logs]([status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_IC_Logs_folio_interno] ON [dbo].[IC_Logs]([folio_interno]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_IC_Logs_cliente_code] ON [dbo].[IC_Logs]([cliente_code]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_IC_Logs_user_date] ON [dbo].[IC_Logs]([user], [created_at] DESC);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_IC_Logs_cliente_date] ON [dbo].[IC_Logs]([cliente], [created_at] DESC);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_IC_Codes_log_id] ON [dbo].[IC_Codes]([log_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_IC_Codes_log_producto] ON [dbo].[IC_Codes]([log_id], [producto]);

-- AddForeignKey
ALTER TABLE [dbo].[IC_Codes] ADD CONSTRAINT [IC_Codes_log_id_fkey] FOREIGN KEY ([log_id]) REFERENCES [dbo].[IC_Logs]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
