-- Демонстрационные записи для локальной проверки. Пароли отсутствуют: вход выполняется через ChatGPT.
INSERT OR IGNORE INTO users (id, email, name, phone, selected_plan, payment_status, access_granted)
VALUES
  ('local_seedy', 'seedy@sites.test', 'Локальный администратор', '+7 900 000-00-00', 'vip', 'confirmed', 1),
  ('demo_student', 'student@example.invalid', 'Тестовый пользователь', '+7 900 111-22-33', 'standard', 'pending', 0);
