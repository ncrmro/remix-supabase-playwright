INSERT INTO auth.users (instance_id, id, aud, "role", email, encrypted_password, email_confirmed_at, last_sign_in_at,
                        raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone,
                        phone_confirmed_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'f76629c5-a070-4bbc-9918-64beaea48848'::uuid, 'authenticated',
        'authenticated', 'test@example.com', '$2a$10$PznXR5VSgzjnAp7T/X7PCu6vtlgzdFt1zIr41IqP0CmVHQtShiXxS',
        '2022-02-11 21:02:04.547', '2022-02-11 22:53:12.520', '{
    "provider": "email",
    "providers": [
      "email"
    ]
  }';

INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES ('f76629c5-a070-4bbc-9918-64beaea48848', 'f76629c5-a070-4bbc-9918-64beaea48848'::uuid, '{
  "sub": "f76629c5-a070-4bbc-9918-64beaea48848"
}', 'email', '2022-02-11 21:02:04.545', '2022-02-11 21:02:04.545', '2022-02-11 21:02:04.545')
ON CONFLICT (id, provider) DO NOTHING;

INSERT INTO todos (user_id, text, completed)
VALUES ((SELECT id FROM auth.users WHERE email = 'test@example.com'), 'Read Remix Docs', TRUE),
       ((SELECT id FROM auth.users WHERE email = 'test@example.com'), 'Read Playwright Docs', FALSE),
       ((SELECT id FROM auth.users WHERE email = 'test@example.com'), 'Read Supabase Docs', FALSE);