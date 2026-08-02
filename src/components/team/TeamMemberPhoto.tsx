import Image from "next/image";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/types";

type TeamMemberPhotoProps = {
  member: TeamMember;
  className?: string;
};

function getInitials(name: string) {
  const words = name.replace(/\./g, "").split(" ").filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const second = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + second).toUpperCase();
}

export function TeamMemberPhoto({ member, className }: TeamMemberPhotoProps) {
  if (member.photoPath) {
    return (
      <div className={cn("relative overflow-hidden bg-herbal-soft", className)}>
        <Image
          alt={`Foto ${member.name}`}
          className="object-cover"
          fill
          sizes="(max-width: 640px) 40vw, 200px"
          src={member.photoPath}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex items-center justify-center bg-herbal-soft text-herbal-deep",
        className,
      )}
    >
      <span className="text-lg font-bold sm:text-2xl">
        {getInitials(member.name)}
      </span>
    </div>
  );
}
