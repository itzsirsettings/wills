import { mediaPath, videoPath } from './brand';

export type ProjectCategory = 'Doors' | 'Gates' | 'Grilles' | 'Fabrication' | 'Interiors';
export interface ProjectImage {
  number: string;
  category: ProjectCategory;
  title: string;
  alt: string;
}

export const projectImages: ProjectImage[] = [
  { number: '0067', category: 'Gates', title: 'Black & gold entrance gate', alt: 'Black double entrance gate with gold ornamental detailing' },
  { number: '0039', category: 'Doors', title: 'Sculpted entrance door', alt: 'Black metal door with a curved wood-tone panel and long silver handle' },
  { number: '0046', category: 'Doors', title: 'Geometric metal door', alt: 'Black metal door with horizontal silver accents' },
  { number: '0064', category: 'Gates', title: 'Gold-pattern entrance gate', alt: 'Black entrance gate with gold geometric trim and ornaments' },
  { number: '0023', category: 'Grilles', title: 'Decorative window grille', alt: 'Gold and black ornamental metal window grille mounted over an arched opening' },
  { number: '0054', category: 'Fabrication', title: 'Structural steel framework', alt: 'Red-painted structural steel framework beside a building' },
  { number: '0018', category: 'Doors', title: 'Polished gold door', alt: 'Gold-tone metal entrance door with a glazed decorative lattice panel' },
  { number: '0019', category: 'Gates', title: 'Modern panel gate', alt: 'Black gate with contrasting silver decorative inset panels' },
  { number: '0020', category: 'Doors', title: 'Ornamental panel door', alt: 'Dark metal entrance door with raised bronze-colored ornamental panels' },
  { number: '0021', category: 'Gates', title: 'Contemporary entrance', alt: 'Black and silver gate and pedestrian door at a building entrance' },
  { number: '0022', category: 'Grilles', title: 'Entrance security grille', alt: 'Decorative red and gold metal grille over a doorway' },
  { number: '0031', category: 'Gates', title: 'Ornamental gate pair', alt: 'Decorative metal gate leaves at a masonry entrance' },
  { number: '0034', category: 'Gates', title: 'Arched pedestrian gate', alt: 'Black pedestrian gate with gold details and an arched top' },
  { number: '0035', category: 'Doors', title: 'Curved-panel door', alt: 'Black entrance door with a warm curved accent panel' },
  { number: '0036', category: 'Interiors', title: 'Interior door reference', alt: 'Light-colored interior door with a geometric panel arrangement' },
  { number: '0037', category: 'Doors', title: 'Medallion door', alt: 'Black metal door with a bronze-tone circular medallion' },
  { number: '0038', category: 'Doors', title: 'Vertical accent door', alt: 'Black door with a tall wood-tone center panel and gold trim' },
  { number: '0040', category: 'Doors', title: 'Slatted entrance door', alt: 'Metal door with horizontal wood-tone slats and silver lines' },
  { number: '0041', category: 'Doors', title: 'Linear panel door', alt: 'Black metal door with horizontal warm-toned panel detailing' },
  { number: '0042', category: 'Doors', title: 'Raised-panel entrance', alt: 'Dark entrance door with inset gold-trimmed rectangular panels' },
  { number: '0043', category: 'Doors', title: 'Angular metal door', alt: 'Black-framed entrance door with diagonal geometric metal detailing' },
  { number: '0044', category: 'Doors', title: 'Double entrance doors', alt: 'Pair of wood-tone doors with black metal frames' },
  { number: '0045', category: 'Doors', title: 'Decorative bronze door', alt: 'Dark ornate entrance door with bronze-tone raised detailing' },
  { number: '0047', category: 'Grilles', title: 'Patterned window grille', alt: 'Rectangular decorative metal grille over a window' },
  { number: '0052', category: 'Fabrication', title: 'Steel frame assembly', alt: 'Red structural steel frame alongside a building' },
  { number: '0053', category: 'Fabrication', title: 'Elevated steel platform', alt: 'Red steel framework supporting an elevated platform' },
  { number: '0061', category: 'Gates', title: 'Horizontal slat gate', alt: 'Dark double gate with horizontal upper slats and patterned lower panels' },
  { number: '0062', category: 'Gates', title: 'Decorative arched gate', alt: 'Arched metal gate with gold ornamentation and red circular accents' },
  { number: '0063', category: 'Gates', title: 'Copper-tone gate', alt: 'Metal entrance gate with copper-tone panels and circular decorative accents' },
  { number: '0065', category: 'Gates', title: 'Modern slatted gate', alt: 'Dark red and black entrance gate with horizontal slats' },
  { number: '0066', category: 'Gates', title: 'Arched gold-detail gate', alt: 'Metal gate with an arched top and gold decorative detailing' },
  { number: '0069', category: 'Gates', title: 'Panelled ornamental gate', alt: 'Large dark metal gate with red and gold ornamental panels' },
  { number: '0081', category: 'Gates', title: 'Ornamental gate design', alt: 'Decorative black gate with gold geometric borders and circular ornamentation' },
];

export const projectSrc = (project: ProjectImage, small = false) => mediaPath(project.number, small);
export const suppliedVideos = ['0017', '0083', '0084', '0085', '0086', '0087', '0088', '0089', '0090', '0091', '0092', '0093'].map(videoPath);
