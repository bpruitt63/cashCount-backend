DROP DATABASE IF EXISTS cash_count;
CREATE DATABASE cash_count;
\connect cash_count

\i cashCount-schema.sql
\i cashCount-seed.sql

DROP DATABASE IF EXISTS cash_count_test;
CREATE DATABASE cash_count_test;
\connect cash_count_test

\i cashCount-schema.sql