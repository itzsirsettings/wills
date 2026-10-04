-- Seed data for Stankings Trade Hub
-- Run this in your Supabase SQL Editor after running the initial_schema.sql

-- CATEGORIES
INSERT INTO categories (name, caption, sku_count, icon) VALUES
('Living Room', 'Statement sofas and lounge systems', '96 SKUs', 'sofa'),
('Bedroom', 'Beds, headboards and hospitality sets', '82 SKUs', 'bed'),
('Appliances', 'Consumer electronics and white goods', '74 SKUs', 'appliance'),
('Office', 'Executive desks, chairs and meeting rooms', '68 SKUs', 'office'),
('Decor', 'Dining, rugs, mirrors and finishing touches', '51 SKUs', 'decor'),
('Projects', 'Bulk custom sourcing and fit-out contracts', '49 briefs', 'project');

-- SUPPLIERS
INSERT INTO suppliers (name, specialty, score, fulfillment, markets) VALUES
('Stankings Contract Studio', 'Hotels, serviced apartments, executive residences', '4.9/5', '97% on-time', 'Asaba, Benin, Port Harcourt'),
('Delta Appliance Depot', 'TVs, cooling systems, kitchen and white goods', '4.8/5', '41 verified runs', 'Delta, Edo, Anambra'),
('Turkish Sofa Collective', 'Imported sofa suites, premium upholstery, custom finishes', '4.9/5', '22 day lead', 'Nigeria South-South'),
('Boardroom Works', 'Office furniture and ergonomic solutions', '4.7/5', '18 verified runs', 'Lagos, Asaba'),
('Delta Timber Craft', 'Custom woodwork and local furniture production', '4.6/5', '12 day lead', 'Delta State'),
('Interior Finish House', 'Decor and finishing touches', '4.6/5', '95% on-time', 'Regional');

-- PRODUCTS
INSERT INTO products (id, name, price, category, image, supplier, origin, moq, lead_time, rating, orders, badge, summary) VALUES
(1, 'Turkish Presidential Sofa Suite', 450000, 'Living Room', '/images/product-1.jpg', 'Turkish Sofa Collective', 'Asaba showroom stock', '2 sets', '7-10 days', 4.9, '148 closed orders', 'Fast customization', 'High-density seating with carved trim, velvet blend upholstery and lobby-grade presence.'),
(2, 'Modern Platform Bed Frame', 280000, 'Bedroom', '/images/product-2.jpg', 'Stankings Contract Studio', 'Delta production lane', '3 frames', '5-8 days', 4.8, '83 hospitality orders', 'Ready for hotels', 'Clean-lined upholstered bed frame for short-let apartments and premium bedrooms.'),
(3, 'Executive Task Chair', 85000, 'Office', '/images/product-3.jpg', 'Boardroom Works', 'Lagos partner warehouse', '6 chairs', '4-6 days', 4.7, '210 office seats moved', 'Top ranking', 'Mesh-backed ergonomic chair with procurement-friendly pricing for teams and training rooms.'),
(4, 'Cloud L-Shape Lounge Sofa', 380000, 'Living Room', '/images/product-4.jpg', 'Turkish Sofa Collective', 'Imported on request', '1 suite', '14 days', 4.9, '67 signed projects', 'Premium finish', 'Soft-profile sectional sofa favored for family lounges and executive waiting areas.'),
(5, 'Samsung Smart TV 55"', 320000, 'Appliances', '/images/product-5.jpg', 'Delta Appliance Depot', 'Regional stock', '2 units', '48 hours', 4.8, '91 corporate installs', 'Ready to dispatch', 'Popular hospitality and home-upgrade TV package with wall-mount sourcing support.'),
(6, 'Persian Heritage Rug', 65000, 'Decor', '/images/product-6.jpg', 'Interior Finish House', 'Curated decor floor', '4 pieces', '3-5 days', 4.6, '173 decor bundles', 'Buyer favorite', 'Accent rug line for lounges, reception areas and furnished apartments.'),
(7, 'Glass Dining Collection', 195000, 'Decor', '/images/product-7.jpg', 'Stankings Contract Studio', 'Asaba display floor', '2 sets', '6-9 days', 4.7, '58 dining projects', 'Seasonal demand', 'Compact modern dining package for urban homes, restaurants and serviced units.'),
(8, 'Hisense Inverter Refrigerator', 245000, 'Appliances', '/images/product-8.jpg', 'Delta Appliance Depot', 'On-hand stock', '2 units', '48 hours', 4.8, '113 fulfilled appliance orders', 'Logistics priority', 'Reliable fridge line for furnished apartments, stores and kitchen upgrades.');

-- PRODUCT GALLERIES
INSERT INTO product_galleries (id, product_id, image, title, caption, object_position, image_transform) VALUES
('1-slide-1', 1, '/images/product-1.jpg', 'Hero angle', 'Full silhouette framing for the main furniture presence.', 'center center', 'scale(1.04)'),
('1-slide-2', 1, '/images/product-1.jpg', 'Texture angle', 'Closer framing around arms, cushions and material finish.', '28% center', 'scale(1.14)'),
('2-slide-1', 2, '/images/product-2.jpg', 'Headboard angle', 'Front framing focused on the full bed profile and scale.', 'center center', 'scale(1.05)'),
('3-slide-1', 3, '/images/product-3.jpg', 'Desk-side angle', 'Main profile view for posture, form and workspace fit.', 'center center', 'scale(1.04)');

-- PRODUCT TAGS
INSERT INTO product_tags (product_id, tag) VALUES
(1, 'Hot this week'), (1, 'Custom fabrics'), (1, 'Hotel-ready'),
(2, 'Bulk headboards'), (2, 'Airbnb fit-out'), (2, 'Wood core'),
(3, 'B2B bestseller'), (3, 'Quick ship'), (3, 'Warranty'),
(5, 'Fast moving'), (5, 'Hospitality AV'), (5, 'Warranty');
