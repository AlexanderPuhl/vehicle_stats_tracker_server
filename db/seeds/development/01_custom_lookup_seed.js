exports.seed = function (knex) {
  return knex('custom_lookup').del()
    .then(() => knex('custom_lookup').insert([
      {
        custom_lookup_code: 'vehicle_type',
        custom_lookup_descr: 'vehicle_type',
      },
      {
        custom_lookup_code: 'vehicle_make',
        custom_lookup_descr: 'vehicle_make',
      },
      {
        custom_lookup_code: 'vehicle_model',
        custom_lookup_descr: 'vehicle_model',
      },
      {
        custom_lookup_code: 'vehicle_sub_model',
        custom_lookup_descr: 'vehicle_sub_model',
      },
      {
        custom_lookup_code: 'vehicle_transmission_type',
        custom_lookup_descr: 'vehicle_transmission_type',
      },
      {
        custom_lookup_code: 'vehicle_drive_type',
        custom_lookup_descr: 'vehicle_drive_type',
      },
      {
        custom_lookup_code: 'vehicle_body_type',
        custom_lookup_descr: 'vehicle_body_type',
      },
      {
        custom_lookup_code: 'vehicle_bed_type',
        custom_lookup_descr: 'vehicle_bed_type',
      },
      {
        custom_lookup_code: 'distance_unit',
        custom_lookup_descr: 'distance_unit',
      },
      {
        custom_lookup_code: 'volume_unit',
        custom_lookup_descr: 'volume_unit',
      },
      {
        custom_lookup_code: 'fuel_type',
        custom_lookup_descr: 'fuel_type',
      },
    ]));
};
