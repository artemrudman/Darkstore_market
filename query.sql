INSERT INTO worker VALUES
    (default, 1, 'Artem Rudman', 'artemrudman@gmail.com', '972515859941', 0, 0, false, '73421c8a0147b8a1cf89704a626abd92996098d58b582d88c9b9b104bb21b9a8', default, 1),
    (default, 1, 'Dmitry Khamkov', 'xysed2969@yandex.ru', '79135903791', 0, 0, false, '45499a804e0cc4b66a63a995fd67d244dbd6fb2878b043730a1699aa6698b24c', default, 1);

INSERT INTO branch VALUES
    (default, 'Vienna Center', 'Getreidemarkt 10, 1010 Wien, Austria', 'Europe/Vienna', '3216540987', 0, '37ddae764f4d586e3203f878b7091a65f7dbd2bb87b356b6aeee6a2a60fba993', default, 1),
    (default, 'Berlin Center', 'Wolffring 72, 12101 Berlin, Germany', 'Europe/Berlin', '4563791357', 0, '6a76571898c9175016b7beed881b2dd864894de17407c8ce19e4e895f45e1f95', default, 1);

INSERT INTO branch_working_hours VALUES
    (1, 0, '07:00', '23:00'),
    (1, 0, 1, '07:00', '23:00'),
    (1, 0, 2, '07:00', '23:00'),
    (1, 0, 3, '07:00', '23:00'),
    (1, 0, 4, '07:00', '23:00'),
    (1, 0, 5, '07:00', '21:00'),
    (1, 0, 6, '07:00', '21:00'),
    
    (2, 0, 0, '09:00', '22:00'),
    (2, 0, 1, '09:00', '22:00'),
    (2, 0, 2, '09:00', '22:00'),
    (2, 0, 3, '09:00', '22:00'),
    (2, 0, 4, '09:00', '22:00'),
    (2, 1, 5, '00:00', '00:00'),
    (2, 1, 6, '00:00', '00:00');

INSERT INTO worker VALUES
    (default, 1, 'Liam Anderson', 'liam.anderson@mailinator.com', '61298765432', 1, 0, false, '218c874595ac3f459d21c7ce46b31f42069a59fdee8bbd69e50ac0c5310b09fb', default, 1),
    (default, 1, 'Mia Smith', 'mia.smith@tempmail.org', '11234567890', 2, 0, false, '163236c13755b49aa01cdda5fe53ab617beed939d28beb60769d182fd36a9b89', default, 1),
    (default, 1, 'Olivia Martinez', 'olivia.martinez@inbox.com', '442012345678', 3, 0, false, '035fab09d0da983906a814c60edfec2d2faa809c900c6f8d4288d0cc6d922441', default, 1),
    (default, 1, 'Emma Taylor', 'emma.taylor@icloud.com', '493012345678', 5, 0, false, 'd343e77bac6eb012ce864fff65676bcbb446a3e6a9148c8b69b1db6c546b149f', default, 1),
    (default, 1, 'William Miller', 'william.miller@outlook.com', '493012345678', 6, 0, false, 'e3439d4abccf85198c5eae5ea1663e028358a7e62ee6c98281e5ce3be05b8e8d', default, 1),
    (default, 2, 'Ava Johnson', 'ava.johnson@yahoo.com', '81312345678', 1, 0, false, '20d7e4850c51e0c3bb05f36058ec9871acbecd3a703d96fe51d95ed914842eec', default, 1),
    (default, 2, 'Sophia Smith', 'sophia.smith@gmail.com', '861012345678', 2, 0, false, '54251774e1754ebd2fb7538209a286155474d556e7e4b570a59f996726f707fe', default, 1),
    (default, 2, 'Benjamin Harris', 'benjamin.harris@mailinator.com', '5511987654321', 3, 0, false, '5ed3a8576bf17ce40f2bdf0d812fb2511249bff27a8f4446fc0612d70d78d3e6', default, 1),
    (default, 2, 'Ava Miller', 'ava.miller@yahoo.com', '85223456789', 5, 0, false, '0f6db5cdb439ec1b61ebd7ef04b8b868f564ffddbc7603ce221d205dbb0d6e63', default, 1),
    (default, 2, 'Jack Miller', 'jack.miller@outlook.com', '31201234567', 6, 0, false, 'fa1e24167fac11c4fa3f6907ce93746558a2ebf2cf31bee832b728ad07cde1aa', default, 1);

INSERT INTO worker VALUES
    (default, 1, 'James Jones', 'james.jones@protonmail.com', '33123456789', 3, 0, false, 'efffae9065c95d6102aff8dc5dc1df7ecba881d2c04d83f8fe70dd8113b0d048', default, 1),
    (default, 1, 'Sophia Robinson', 'sophia.robinson@gmail.com', '46812345678', 4, 0, false, 'fe7c7abd30f34279ad6a13646b8b15791157ba7be0a9091d4abbc6bb4f574c4d', default, 1),
    (default, 1, 'James Moore', 'james.moore@protonmail.com', '41441234567', 4, 0, false, 'e208bf7a4e012a6624306b3470116a268aa9c37be0cc44169b72a4195ab8a008', default, 1),
    (default, 2, 'Emma Garcia', 'emma.garcia@icloud.com', '33123456789', 3, 0, false, '093107f7378e1eaa9e34ac4d338769dd8bd6a3ae98a63ddccd5739c861b671a1', default, 1),
    (default, 2, 'Michael Hall', 'michael.hall@example.com', '390612345678', 4, 0, false, 'c2c06c86bd34cde229948cf672ded3bb5cb4fdff51cb6ca7c065b3423f5e2541', default, 1),
    (default, 2, 'Olivia Martin', 'olivia.martin@inbox.com', '85298765432', 4, 0, false, 'c3692e1f01a8aa674ec4a064690703a4527152e2f715dc5d4f0ae6b2bba74742', default, 1),