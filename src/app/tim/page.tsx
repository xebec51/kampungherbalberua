import type { Metadata } from "next";
import { HoverCard } from "@/components/motion/HoverCard";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TeamMemberPhoto } from "@/components/team/TeamMemberPhoto";
import { getDisplayOrderedTeamMembers } from "@/data/team";
import { createPageMetadata } from "@/lib/metadata";

const teamMembers = getDisplayOrderedTeamMembers();

export const metadata: Metadata = createPageMetadata({
  title: "Tim KKN",
  description:
    "Informasi tim KKN Kampung Herbal Berua tanpa menampilkan nomor telepon atau data pribadi sensitif.",
  path: "/tim",
});

export default function TeamPage() {
  return (
    <section className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <Reveal>
          <SectionHeading
            description="Kontribusi setiap bidang terintegrasi berdasarkan hasil program kerja di lapangan. Halaman ini tidak menampilkan NIM, nomor telepon, alamat, atau data pribadi lainnya."
            eyebrow="Tim KKN"
            title="Kolaborasi lintas bidang"
          />
        </Reveal>
        <StaggerGroup className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <StaggerItem key={member.id}>
              <HoverCard
                as="article"
                className="flex h-full overflow-hidden rounded-md border border-herbal-green/10 bg-white shadow-sm"
              >
                <TeamMemberPhoto
                  className="w-[40%] shrink-0 sm:w-[38%]"
                  member={member}
                />
                <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-5">
                  <StatusBadge tone="green">{member.studyProgram}</StatusBadge>
                  <h2 className="mt-2 line-clamp-2 text-sm font-bold text-herbal-ink sm:mt-3 sm:text-base">
                    {member.name}
                  </h2>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-herbal-muted sm:mt-2 sm:text-sm sm:leading-6">
                    {member.contribution}
                  </p>
                </div>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
