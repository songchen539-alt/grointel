// GroIntel DATA-3 — Activity Outcome Observer
import { GrowthOutcome } from "./activity_types";

export class ActivityOutcomeObserver {
  private counter = 0;
  observe(activityId: string, traffic: number, leads: number, revenue: number, conversion: number, followers: number, engagement: number, brandLift: number, retention: number, cac: number, ltv: number, roi: number, confidence = 60): GrowthOutcome {
    return { id:"ao_"+(++this.counter).toString(16).padStart(6,"0"), activity_id: activityId, traffic, leads, revenue, conversion_rate: conversion, followers_gained: followers, engagement_rate: engagement, brand_lift: brandLift, retention_rate: retention, cac, ltv, roi, confidence };
  }
}
