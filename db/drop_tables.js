const pg = require('./pg');

const dropTables = async () => {
  await pg.query('DROP TABLE public.trip');
  await pg.query('DROP TABLE public.service');
  await pg.query('DROP TABLE public.fuel_purchase');
  await pg.query('DROP TABLE public.vehicle');
  await pg.query('DROP TABLE public.user');
  await pg.query('DROP TABLE public.country');
  await pg.query('DROP TABLE public.custom_lookup_value');
  await pg.query('DROP TABLE public.custom_lookup');
  await pg.query('DROP TABLE public.knex_migrations_lock');
  await pg.query('DROP TABLE public.knex_migrations');
};

dropTables();
