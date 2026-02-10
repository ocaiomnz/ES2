-- ========== SEED COM DADOS ATUAIS DO BANCO ==========
-- Gerado a partir do banco em uso. Para usar em outra máquina:
-- 1. Configure DATABASE_URL no .env
-- 2. Rode: npx prisma migrate deploy
-- 3. Rode: npx prisma db execute --file prisma/seed-dados-atual.sql --schema prisma/schema.prisma
--
-- Atenção: Este arquivo insere dados. Se as tabelas já tiverem dados, pode haver conflito de chave primária.
-- Para banco vazio (após migrate), use normalmente.

-- Escola
INSERT INTO "Escola" ("id", "nome", "endereco", "createdAt", "updatedAt") VALUES
  ('11111111-1111-1111-1111-111111111111', 'Escola Modelo SAPEA', 'Rua Exemplo, 100', '2026-02-05 16:08:29.245', '2026-02-05 16:08:29.245'),
  ('250b4fab-fe46-4a16-8916-11af422c5ee9', 'Escola teste', 'teste', '2026-02-06 17:08:45.529', '2026-02-06 17:08:45.529');

-- Usuario
INSERT INTO "Usuario" ("id", "nome", "email", "senhaHash", "tipoPerfil", "escolaId", "createdAt", "updatedAt") VALUES
  ('22222222-2222-2222-2222-222222222201', 'Maria Professora', 'prof@escola.com', '$2b$10$yjlPQw0YagpTeFwi2rvuge0piUbBIUj4nJRND4Xrv3ENbEwsu.Gme', 'EQUIPE_ESCOLAR', '11111111-1111-1111-1111-111111111111', '2026-02-05 16:08:29.245', '2026-02-05 16:08:29.245'),
  ('22222222-2222-2222-2222-222222222202', 'João Responsável', 'responsavel@email.com', '$2b$10$yjlPQw0YagpTeFwi2rvuge0piUbBIUj4nJRND4Xrv3ENbEwsu.Gme', 'RESPONSAVEL', NULL, '2026-02-05 16:08:29.245', '2026-02-05 16:08:29.245'),
  ('22222222-2222-2222-2222-222222222203', 'Admin Sistema', 'admin@sapea.com', '$2b$10$yjlPQw0YagpTeFwi2rvuge0piUbBIUj4nJRND4Xrv3ENbEwsu.Gme', 'ADMIN', NULL, '2026-02-05 16:08:29.245', '2026-02-05 16:08:29.245'),
  ('c8e174c2-43f8-4b35-be55-52f086e2655e', 'Caio Machado', 'caioenzo7@gmail.com', '$2b$10$bu/HcBPh/0Tr9BmLB04uWeCG3OgbsxZlPT.PlRfM.oOXoGeSCHMQO', 'RESPONSAVEL', NULL, '2026-02-06 17:02:21.08', '2026-02-06 17:02:21.076'),
  ('7db21c1c-f798-4a26-b1da-673dfa6067bd', 'Henrique', 'henrique@gmail.com', '$2b$10$uZ0MwK9dE/NpQXJAyv3IxOjM2c5eSTN.2J/QX8std279BcNy8w6JG', 'ADMIN', NULL, '2026-02-06 17:06:37.631', '2026-02-06 17:06:37.629'),
  ('249c1d27-f511-4fd7-99cf-a4b423e11c73', 'victor', 'vi@gmail.com', '$2b$10$dqWnfXV7bPzJABuCIyo6iOUESw4whZDCNwcdpHc8yAda926WjbP2q', 'PROFESSOR', '250b4fab-fe46-4a16-8916-11af422c5ee9', '2026-02-06 17:10:33.607', '2026-02-06 17:10:33.605'),
  ('3697bde6-d5d9-4d30-844d-9ed028112275', 'Célia', 'adm@adm.com', '$2b$10$G9Q7MLIo5ahmet8pKJ3Wue90HhuKAtiF3uteQqRuWJyEW71r58PyW', 'EQUIPE_ESCOLAR', '250b4fab-fe46-4a16-8916-11af422c5ee9', '2026-02-06 17:21:30.876', '2026-02-06 17:21:30.875'),
  ('e7c98f28-6992-4c0b-8fce-fa6e74c386b8', 'mateus', 'matheus@gmail.com', '$2b$10$Z/uSRKi.o9ZjpKB/t5MuUOlo6a.8sk8i5l.n7bV6xaEIV99acxljS', 'CRIANCA', NULL, '2026-02-06 17:24:30.617', '2026-02-06 17:24:30.615'),
  ('b94edc35-c78a-4172-83e9-00a21d03dd43', 'Ana Paula Carvalho de Menezes', 'ana@gmail.com', '$2b$10$/Z0NtyENvEi9SiueVIF6hu8MoI7KFoK2UFnbEJcxTwPxuzqhZn5Ay', 'CRIANCA', NULL, '2026-02-06 17:35:24.531', '2026-02-06 17:35:24.53'),
  ('a8903910-b5ca-4363-9b7f-60e7f9e3a1a4', 'escolar', 'escola@gmail.com', '$2b$10$6HD5f6Knh8dIH2.P9MjSqeIYSIdnt9eflzT8HhIWaqJC7wpQevU.y', 'EQUIPE_ESCOLAR', '11111111-1111-1111-1111-111111111111', '2026-02-06 18:05:51.016', '2026-02-06 18:05:51.014'),
  ('822d161b-9c05-4f6f-9206-70313e5857bd', 'Caio Teste', 'caioteste@gmail.com', '$2b$10$QRqfvK8i2ioCKD.Hun0TauIvk2C1r0tv.SQtzWlXSf.saClvxIbru', 'PROFESSOR', '11111111-1111-1111-1111-111111111111', '2026-02-06 21:48:29.754', '2026-02-06 21:48:29.749'),
  ('8be0735b-62b1-47e5-a00f-fb1562b285eb', 'adulto', 'adulto@gmail.com', '$2b$10$PmE.AO1AMo7HHvMSntwNZ.Qp1wDUvwhya0FBnEZCsF3jNn.bbjuLe', 'RESPONSAVEL', NULL, '2026-02-06 21:51:16.074', '2026-02-06 21:51:16.072');

-- Crianca (id, nome, dataNascimento, grauTEA, grauSuporte, escolaId, usuarioId, createdAt, updatedAt)
INSERT INTO "Crianca" ("id", "nome", "dataNascimento", "grauTEA", "grauSuporte", "escolaId", "usuarioId", "createdAt", "updatedAt") VALUES
  ('33333333-3333-3333-3333-333333333301', NULL, '2015-05-10 00:00:00', 'LEVE', 'NIVEL_1', '11111111-1111-1111-1111-111111111111', NULL, '2026-02-05 16:08:29.245', '2026-02-05 19:27:05.999'),
  ('86b32403-151f-4a51-9ec0-5aca63fde31c', NULL, '2020-05-15 00:00:00', 'SEVERO', 'NIVEL_3', '250b4fab-fe46-4a16-8916-11af422c5ee9', NULL, '2026-02-06 17:09:37.235', '2026-02-06 17:09:37.234'),
  ('6b3660aa-c149-409f-b385-ee688f93308a', NULL, '2015-12-27 00:00:00', 'MODERADO', 'NIVEL_2', '250b4fab-fe46-4a16-8916-11af422c5ee9', NULL, '2026-02-06 17:08:46.883', '2026-02-06 17:22:45.704'),
  ('1b3e8aeb-2a60-4265-b2c8-d0fcc8f654e3', NULL, '2020-08-30 00:00:00', 'LEVE', 'NIVEL_1', '250b4fab-fe46-4a16-8916-11af422c5ee9', NULL, '2026-02-06 17:34:40.262', '2026-02-06 17:34:40.26'),
  ('cf99e4e5-f1a4-45b8-b8c4-22ff88501eb3', 'Lucas', '2025-12-27 00:00:00', 'LEVE', 'NIVEL_1', '11111111-1111-1111-1111-111111111111', NULL, '2026-02-06 18:06:37.713', '2026-02-06 18:06:37.711'),
  ('ecb64d91-742b-444b-9223-ea84294f8981', 'Criança teste', '2025-12-27 00:00:00', 'MODERADO', 'NIVEL_2', '11111111-1111-1111-1111-111111111111', NULL, '2026-02-06 21:52:14.735', '2026-02-06 21:56:06.397');

-- CriancaResponsavel
INSERT INTO "CriancaResponsavel" ("id", "criancaId", "responsavelId", "createdAt") VALUES
  ('ac9df8e0-a3ee-4852-918c-e6856e9c1acd', '33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222202', '2026-02-05 19:27:06'),
  ('0eed2d66-040d-4143-8de9-38c95ac5e67c', '86b32403-151f-4a51-9ec0-5aca63fde31c', 'c8e174c2-43f8-4b35-be55-52f086e2655e', '2026-02-06 17:09:37.235'),
  ('a5836cc6-6b01-4ce4-bead-60abfcdb7434', '6b3660aa-c149-409f-b385-ee688f93308a', 'c8e174c2-43f8-4b35-be55-52f086e2655e', '2026-02-06 17:22:45.706'),
  ('1381a85d-4de0-4810-bb49-73ae2441973d', 'ecb64d91-742b-444b-9223-ea84294f8981', '8be0735b-62b1-47e5-a00f-fb1562b285eb', '2026-02-06 21:56:06.398');

-- AmbienteEscolar
INSERT INTO "AmbienteEscolar" ("id", "escolaId", "nome", "descricao", "midias", "createdAt", "updatedAt") VALUES
  ('55555555-5555-5555-5555-555555555501', '11111111-1111-1111-1111-111111111111', 'Sala de Aula', 'Ambiente principal de estudos', NULL, '2026-02-05 16:08:29.245', '2026-02-05 16:08:29.245'),
  ('55555555-5555-5555-5555-555555555502', '11111111-1111-1111-1111-111111111111', 'Refeitório', 'Onde os alunos fazem as refeições', NULL, '2026-02-05 16:08:29.245', '2026-02-05 16:08:29.245'),
  ('13388a6d-4218-4429-859a-a4e7f5320587', '11111111-1111-1111-1111-111111111111', 'Escola do lado', 'lado', NULL, '2026-02-05 19:20:15.161', '2026-02-05 19:20:15.121'),
  ('d6ddc4d3-5765-4961-aaf9-033151bb7666', '250b4fab-fe46-4a16-8916-11af422c5ee9', 'Sala de Aula teste', 'teste', NULL, '2026-02-06 17:23:27.616', '2026-02-06 17:23:27.58'),
  ('ba811574-1cbc-49ea-a926-c39839edc9e2', '250b4fab-fe46-4a16-8916-11af422c5ee9', 'amizade', 'teste', NULL, '2026-02-06 17:23:35.292', '2026-02-06 17:23:35.29');

-- Evento
INSERT INTO "Evento" ("id", "criancaId", "titulo", "dataHoraInicio", "dataHoraFim", "nivelRisco", "status", "descricao", "createdAt", "updatedAt") VALUES
  ('66666666-6666-6666-6666-666666666601', '33333333-3333-3333-3333-333333333301', 'Aula de Português', '2026-02-05 08:00:00', '2026-02-05 09:00:00', 'VERDE', 'PENDENTE', NULL, '2026-02-05 16:08:29.245', '2026-02-05 16:08:29.245'),
  ('66666666-6666-6666-6666-666666666602', '33333333-3333-3333-3333-333333333301', 'Lanche', '2026-02-05 10:30:00', '2026-02-05 11:00:00', 'VERDE', 'PENDENTE', NULL, '2026-02-05 16:08:29.245', '2026-02-05 16:08:29.245'),
  ('eeb1cee3-dd62-4bf7-9b0b-99b4ff535c60', '86b32403-151f-4a51-9ec0-5aca63fde31c', 'aula', '2026-02-06 20:21:00', '2026-02-06 21:21:00', 'VERDE', 'PENDENTE', NULL, '2026-02-06 17:21:51.41', '2026-02-06 17:21:51.376'),
  ('9a2bda3d-4ffc-438b-b62d-da1d81ce2a36', '86b32403-151f-4a51-9ec0-5aca63fde31c', 'teste', '2026-02-08 20:21:00', '2026-02-08 21:21:00', 'VERMELHO', 'PENDENTE', NULL, '2026-02-06 17:22:11.166', '2026-02-06 17:22:11.164'),
  ('3cd05b78-6d3f-4216-9dfb-27e9ee2f3c67', 'cf99e4e5-f1a4-45b8-b8c4-22ff88501eb3', 'aula', '2026-02-06 21:06:00', '2026-02-06 22:06:00', 'VERDE', 'PENDENTE', NULL, '2026-02-06 18:06:45.798', '2026-02-06 18:06:45.756');

-- RegistroCrise
INSERT INTO "RegistroCrise" ("id", "criancaId", "dataHora", "intensidade", "descricao", "gatilhoIdentificado", "foiEficaz", "createdAt", "updatedAt") VALUES
  ('77777777-7777-7777-7777-777777777701', '33333333-3333-3333-3333-333333333301', '2026-02-03 00:00:00', 'MEDIA', 'Episódio de ansiedade', 'Mudança de rotina', true, '2026-02-05 19:27:06', '2026-02-05 19:27:05.999'),
  ('f7e28d80-e11b-46d0-9845-bfa1c69c57c1', '33333333-3333-3333-3333-333333333301', '2026-02-05 19:20:00', 'ALTA', 'teste', 'teste', NULL, '2026-02-05 19:27:06', '2026-02-05 19:27:05.999'),
  ('d829eae2-b08a-4d72-bd77-8f1fdf4c2122', '33333333-3333-3333-3333-333333333301', '2026-02-05 19:21:05.133', 'ALTA', 'Botão de ajuda acionado', NULL, NULL, '2026-02-05 19:27:06', '2026-02-05 19:27:05.999'),
  ('33b1a12c-c5bc-4faa-a176-7c55d6e0cffb', '33333333-3333-3333-3333-333333333301', '2026-02-05 19:25:00', 'BAIXA', 'teste', 'teste', NULL, '2026-02-05 19:27:06', '2026-02-05 19:27:05.999'),
  ('0f235555-58e6-40c9-878f-8b886c50c0af', '33333333-3333-3333-3333-333333333301', '2026-02-05 19:27:05.999', 'ALTA', 'Botão de ajuda acionado', NULL, NULL, '2026-02-05 19:27:06', '2026-02-05 19:27:05.999'),
  ('ac0f916b-2d53-410d-b7fd-0fb065074a85', '6b3660aa-c149-409f-b385-ee688f93308a', '2026-02-06 17:12:25.17', 'ALTA', 'Botão de ajuda acionado', NULL, true, '2026-02-06 17:22:45.706', '2026-02-06 17:22:45.704'),
  ('a3efbfb4-995d-40a3-8092-432d13782520', '6b3660aa-c149-409f-b385-ee688f93308a', '2026-02-06 17:12:29.052', 'ALTA', 'Botão de ajuda acionado', NULL, false, '2026-02-06 17:22:45.706', '2026-02-06 17:22:45.704'),
  ('38f7a240-8bb2-4537-9b0f-415ac60a0fed', 'ecb64d91-742b-444b-9223-ea84294f8981', '2026-02-06 21:53:00', 'ALTA', 'teste de crise', 'Gatilho teste', NULL, '2026-02-06 21:56:06.398', '2026-02-06 21:56:06.397'),
  ('f42a577e-bc58-4993-8c56-58c8677f92c1', 'ecb64d91-742b-444b-9223-ea84294f8981', '2026-02-06 21:56:06.396', 'ALTA', 'Botão de ajuda acionado', 'Conflito com colega', NULL, '2026-02-06 21:56:06.398', '2026-02-06 21:56:06.397');

-- PedidoSuporte
INSERT INTO "PedidoSuporte" ("id", "criancaId", "dataHora", "status", "registroCriseId", "localizacao", "createdAt", "updatedAt") VALUES
  ('d2391cba-66d8-4ee0-820c-93ee5d61602d', '33333333-3333-3333-3333-333333333301', '2026-02-05 19:21:05.133', 'PENDENTE', 'd829eae2-b08a-4d72-bd77-8f1fdf4c2122', NULL, '2026-02-05 19:27:06', '2026-02-05 19:27:05.999'),
  ('094c47c3-62f1-4178-a1a0-fe334d1ac9c3', '33333333-3333-3333-3333-333333333301', '2026-02-05 19:27:05.999', 'PENDENTE', '0f235555-58e6-40c9-878f-8b886c50c0af', NULL, '2026-02-05 19:27:06', '2026-02-05 19:27:05.999'),
  ('46619d11-7081-468d-a146-7ade1f298f9b', '6b3660aa-c149-409f-b385-ee688f93308a', '2026-02-06 17:12:25.17', 'PENDENTE', 'ac0f916b-2d53-410d-b7fd-0fb065074a85', NULL, '2026-02-06 17:22:45.706', '2026-02-06 17:22:45.704'),
  ('dae6af83-0c04-434d-a1f1-4d81697a1e51', '6b3660aa-c149-409f-b385-ee688f93308a', '2026-02-06 17:12:29.053', 'PENDENTE', 'a3efbfb4-995d-40a3-8092-432d13782520', NULL, '2026-02-06 17:22:45.706', '2026-02-06 17:22:45.704'),
  ('b3b0d9e0-cfdf-4c25-8060-871328da433e', 'ecb64d91-742b-444b-9223-ea84294f8981', '2026-02-06 21:56:06.396', 'PENDENTE', 'f42a577e-bc58-4993-8c56-58c8677f92c1', NULL, '2026-02-06 21:56:06.398', '2026-02-06 21:56:06.397');

-- Intervencao
INSERT INTO "Intervencao" ("id", "criancaId", "dataHora", "estrategia", "aplicadaPor", "resultado", "createdAt", "updatedAt") VALUES
  ('8db3c7f7-b31b-4d99-a2f6-58d1d78dec6d', '33333333-3333-3333-3333-333333333301', '2026-02-05 19:20:00', 'testre', 'Equipe Escolar', NULL, '2026-02-05 19:27:06', '2026-02-05 19:27:05.999'),
  ('77272546-6a41-4d4f-bd86-afb6193eea27', '33333333-3333-3333-3333-333333333301', '2026-02-05 19:25:00', 'teste', 'Equipe Escolar', NULL, '2026-02-05 19:27:06', '2026-02-05 19:27:05.999'),
  ('f59b9523-598e-4e9d-8494-bc474bfde7ab', 'ecb64d91-742b-444b-9223-ea84294f8981', '2026-02-06 21:53:00', 'teste de estratégia', 'Equipe Escolar', NULL, '2026-02-06 21:56:06.398', '2026-02-06 21:56:06.397');

-- PersonalizacaoSensorial
INSERT INTO "PersonalizacaoSensorial" ("id", "criancaId", "paletaCores", "tamanhoFonte", "icones", "sons", "animacoes", "contrasteAlto", "createdAt", "updatedAt") VALUES
  ('f9700377-c83b-4118-9c53-cabb45bf0a62', '6b3660aa-c149-409f-b385-ee688f93308a', NULL, 'MEDIO', NULL, true, true, true, '2026-02-06 17:11:20.357', '2026-02-06 17:12:17.884');
