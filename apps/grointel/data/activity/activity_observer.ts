// GroIntel DATA-3 — Activity Observer
import { GrowthActivity, ActivityCategory, ActivityStatus, GrowthOutcome, GrowthBudget, GrowthTimeline } from "./activity_types";
import { ActivitySourceRegistry } from "./activity_source_registry";
import { ActivityNormalizer } from "./activity_normalizer";
import { ActivityEntityLinker } from "./activity_entity_linker";
import { ActivityStageDetector } from "./activity_stage_detector";
import { ActivityOutcomeObserver } from "./activity_outcome_observer";
import { ActivityCostObserver } from "./activity_cost_observer";
import { ActivityTimelineObserver } from "./activity_timeline_observer";
import { ActivityTraceRecorder } from "./activity_trace";

export class ActivityObserver {
  public readonly sources = new ActivitySourceRegistry();
  public readonly normalizer = new ActivityNormalizer();
  public readonly linker = new ActivityEntityLinker();
  public readonly stages = new ActivityStageDetector();
  public readonly outcomes = new ActivityOutcomeObserver();
  public readonly costs = new ActivityCostObserver();
  public readonly timelines = new ActivityTimelineObserver();
  public readonly traces = new ActivityTraceRecorder();
  public readonly ALL_CATEGORIES: ActivityCategory[] = ["SEO","SEM","Paid Ads","Social Media","Creator Marketing","Influencer Campaign","Affiliate","PR","Podcast","Newsletter","Community","Referral","Events","Partnership","Sales Outreach","Product Launch","Market Entry","Localization","Hiring","AI Automation","Developer Relations","Customer Success","Retention","Pricing","Brand Campaign","Content Marketing"];

  private activities: Map<string, GrowthActivity> = new Map();

  observe(category: ActivityCategory, name: string, objective: string, ownerId: string, channels: string[], region: string, industry: string): GrowthActivity {
    const activity = this.normalizer.normalize(category, name, objective, ownerId, channels, region, industry);
    this.activities.set(activity.id, activity);
    this.traces.record("activity_created", activity.id, `${name} (${category})`);
    return activity;
  }

  advanceStatus(activityId: string, to: ActivityStatus): GrowthActivity | null {
    const a = this.activities.get(activityId);
    if (!a) return null;
    this.stages.transition(a, to);
    this.traces.record("status_changed", activityId, `${a.category}: ${to}`);
    return a;
  }

  linkEntity(activityId: string, participantId: string): void {
    const a = this.activities.get(activityId);
    if (a) { this.linker.link(a, participantId); this.traces.record("entity_linked", activityId, `Linked ${participantId}`); }
  }

  recordOutcome(activityId: string, traffic: number, leads: number, revenue: number, conversion: number, confidence = 60): GrowthOutcome {
    const o = this.outcomes.observe(activityId, traffic, leads, revenue, conversion, 0, 0, 0, 0, 0, 0, 0, confidence);
    this.traces.record("outcome_recorded", activityId, `Revenue: ${revenue}, Traffic: ${traffic}`);
    return o;
  }

  recordCost(activityId: string, budget: number, currency: string, estimatedCost: number, actualCost: number, pricingModel: string, resourceCost: number): GrowthBudget {
    const c = this.costs.observe(activityId, budget, currency, estimatedCost, actualCost, pricingModel, resourceCost);
    this.traces.record("cost_recorded", activityId, `Budget: ${budget} ${currency}`);
    return c;
  }

  getActivity(id: string): GrowthActivity | null { return this.activities.get(id) || null; }
  getAll(): GrowthActivity[] { return Array.from(this.activities.values()); }
}
