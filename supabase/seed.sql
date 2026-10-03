-- =============================================================================
-- SEED: Initial skills data
-- =============================================================================
-- Run after schema.sql. This populates the skills table with the core
-- competency groups. Does NOT fabricate any project or personal content.
-- =============================================================================

-- Mechanical Design & CAD
INSERT INTO skills (name, group_name, order_index) VALUES
  ('3D CAD Modeling',           'mechanical_design_cad', 0),
  ('SolidWorks',                'mechanical_design_cad', 1),
  ('Mechanical Assemblies',     'mechanical_design_cad', 2),
  ('Engineering Drawings',      'mechanical_design_cad', 3),
  ('Design Specifications',     'mechanical_design_cad', 4),
  ('Tolerance Analysis',        'mechanical_design_cad', 5),
  ('GD&T',                      'mechanical_design_cad', 6)
ON CONFLICT DO NOTHING;

-- CAE & Numerical Simulation
INSERT INTO skills (name, group_name, order_index) VALUES
  ('CFD — ANSYS Fluent',        'cae_simulation', 0),
  ('FEA — ANSYS Mechanical',    'cae_simulation', 1),
  ('Mesh Generation',           'cae_simulation', 2),
  ('Boundary Conditions',       'cae_simulation', 3),
  ('Multiphase Flow (VOF)',     'cae_simulation', 4),
  ('Structural Analysis',       'cae_simulation', 5),
  ('Thermal Analysis',          'cae_simulation', 6)
ON CONFLICT DO NOTHING;

-- Robotics & Mechatronics
INSERT INTO skills (name, group_name, order_index) VALUES
  ('Arduino',                   'robotics_mechatronics', 0),
  ('Microcontrollers',          'robotics_mechatronics', 1),
  ('Sensor Integration',        'robotics_mechatronics', 2),
  ('PID Control',               'robotics_mechatronics', 3),
  ('Industrial Automation',     'robotics_mechatronics', 4),
  ('Prototyping',               'robotics_mechatronics', 5),
  ('Pneumatic Systems',         'robotics_mechatronics', 6)
ON CONFLICT DO NOTHING;

-- Computational Engineering
INSERT INTO skills (name, group_name, order_index) VALUES
  ('Python',                    'computational_engineering', 0),
  ('Computer Vision',           'computational_engineering', 1),
  ('Applied Machine Learning',  'computational_engineering', 2),
  ('Process Automation',        'computational_engineering', 3),
  ('Data Analysis',             'computational_engineering', 4)
ON CONFLICT DO NOTHING;
