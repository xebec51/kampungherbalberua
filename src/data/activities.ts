import type { Activity } from "@/types";

export const activities: Activity[] = [];

export const featuredActivities = activities.filter((activity) => activity.featured);
