exports.seed = function (knex) {
	// Deletes ALL existing entries
	return knex('user').del()
		// Inserts seed entries
		.then(() => {
			return knex('user').insert({
				username: 'demo',
				password: '$2a$10$tK/hrMfQoY7beKGzvPp78e7qLC/yjvDyTIwVZe13WSQzCXcXvzIkK',
				email: 'demo@demo.com',
				name: 'demo',
				onboarding: false
			});
		}).then(() => {
			return knex('user').insert({
				username: 'alexpuhl',
				password: '$2a$10$d0WAISKRzKrH3KyR79Hy5O.VwLBA7YDjwpX/iU3NdKNEOgX6Acopi',
				email: 'alexpuhldeveloper@gmail.com',
				name: 'Alex Puhl',
				onboarding: true
			});
		});
};
