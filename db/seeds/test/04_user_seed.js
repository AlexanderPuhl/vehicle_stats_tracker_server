exports.seed = function (knex) {
  return knex('user').del().then(() => knex('user').insert({
    username: 'demo',
    password: '$2a$10$tK/hrMfQoY7beKGzvPp78e7qLC/yjvDyTIwVZe13WSQzCXcXvzIkK',
    email: 'demo@demo.com',
    name: 'demo',
    onboarding: false,
    selected_vehicle_id: 1,
  })).then(() => knex('user').insert({
    username: 'alexpuhl',
    password: '$2a$10$d0WAISKRzKrH3KyR79Hy5O.VwLBA7YDjwpX/iU3NdKNEOgX6Acopi',
    email: 'alexpuhldeveloper@gmail.com',
    name: 'Alex Puhl',
    onboarding: true,
    selected_vehicle_id: 0,
  }));
};
