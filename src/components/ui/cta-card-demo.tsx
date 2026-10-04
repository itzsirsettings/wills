import { CtaCard } from "@/components/ui/cta-card";

export default function CtaCardDemo() {
  return (
    <div className="w-full max-w-4xl p-4">
      <CtaCard
        title="Plan your project"
        subtitle="Doors, gates & interiors"
        description="Share your space, reference design and project requirements with Wills Group of Company."
        buttonText="Prepare a project brief"
        secondaryButtonText="View designs"
        imageSrc="/media/wills/IMG-20261003-WA0038.webp"
        imageAlt="Metal entrance door with a warm-tone panel"
        onButtonClick={() => document.getElementById("contact")?.scrollIntoView()}
        onSecondaryButtonClick={() => document.getElementById("gallery")?.scrollIntoView()}
      />
    </div>
  );
}
