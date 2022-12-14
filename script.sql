USE [CHTPT]
GO
/****** Object:  Table [dbo].[USERINFO]    Script Date: 12/22/2022 9:26:21 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[USERINFO](
	[username] [nchar](32) NOT NULL,
	[password] [nchar](32) NOT NULL,
	[isOnline] [bit] NOT NULL,
	[connectionId] [nchar](200) NOT NULL,
 CONSTRAINT [PK_USER] PRIMARY KEY CLUSTERED 
(
	[username] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
INSERT [dbo].[USERINFO] ([username], [password], [isOnline], [connectionId]) VALUES (N'ducanh                          ', N'123456                          ', 0, N'                                                                                                                                                                                                        ')
INSERT [dbo].[USERINFO] ([username], [password], [isOnline], [connectionId]) VALUES (N'minhquang                       ', N'123456                          ', 0, N'                                                                                                                                                                                                        ')
INSERT [dbo].[USERINFO] ([username], [password], [isOnline], [connectionId]) VALUES (N'ngocduc                         ', N'123456                          ', 0, N'                                                                                                                                                                                                        ')
INSERT [dbo].[USERINFO] ([username], [password], [isOnline], [connectionId]) VALUES (N'ngochuynh                       ', N'123456                          ', 1, N'hWGdMZc_vhRbwF17rjLJvw                                                                                                                                                                                  ')
INSERT [dbo].[USERINFO] ([username], [password], [isOnline], [connectionId]) VALUES (N'thanhtrung                      ', N'123456                          ', 1, N'6MU55Lwyn_MhuidHNOrmYw                                                                                                                                                                                  ')
GO
