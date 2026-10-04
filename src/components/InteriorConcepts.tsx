import { useRef, useState } from 'react';
import DesignLightbox from './DesignLightbox';

const interiorConcepts = [
  { slug: 'living-room', title: 'Living room', alt: 'Interior concept of an ivory living room with walnut panelling and a stone media wall' },
  { slug: 'bedroom', title: 'Bedroom', alt: 'Interior concept of a warm bedroom with an upholstered bed and walnut headboard wall' },
  { slug: 'kitchen', title: 'Fitted kitchen', alt: 'Interior concept of a walnut and ivory kitchen with a stone island' },
  { slug: 'dining-room', title: 'Dining room', alt: 'Interior concept of a walnut dining table with cream chairs and a glass partition' },
  { slug: 'foyer', title: 'Entrance foyer', alt: 'Interior concept of an entrance foyer with timber console and metal stair balustrade' },
  { slug: 'wardrobe', title: 'Fitted wardrobe', alt: 'Interior concept of a walnut walk-in wardrobe with integrated lighting and an upholstered bench' },
];

export default function InteriorConcepts() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const returnFocusRef = useRef<HTMLButtonElement>(null);
  return <div className="wills-container interior-concepts">
    <div className="section-heading"><h2>Spaces to<br /><em>make your own.</em></h2><p>Explore six interior design concepts, from welcoming living spaces to fitted storage. These visual references illustrate design directions for your project discussion.</p></div>
    <div className="interior-concept-grid">{interiorConcepts.map((concept, index) => <figure key={concept.slug}>
      <button type="button" onClick={(event) => { returnFocusRef.current = event.currentTarget; setSelectedIndex(index); }} aria-label={`View ${concept.title} interior design concept`}>
        <img src={`/media/wills/interiors/${concept.slug}-640.webp`} srcSet={`/media/wills/interiors/${concept.slug}-640.webp 640w, /media/wills/interiors/${concept.slug}.webp 1440w`} sizes="(max-width: 760px) 90vw, 45vw" width="1440" height="810" loading="lazy" decoding="async" alt={concept.alt} />
      </button><figcaption>{concept.title}<span>Design concept</span></figcaption>
    </figure>)}</div>
    <DesignLightbox returnFocusRef={returnFocusRef} images={interiorConcepts.map((concept) => ({ src: `/media/wills/interiors/${concept.slug}.webp`, title: concept.title, alt: concept.alt, width: 1440, height: 810 }))} selectedIndex={selectedIndex} onSelectedIndexChange={setSelectedIndex} description="Interior design concept. Discuss your layout, materials and finishing requirements with Wills Group." />
  </div>;
}
