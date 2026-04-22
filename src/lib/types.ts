export interface Swimlane {
  id: string;
  name: string;
  color: string;
}

export interface TimelineBar {
  id: string;
  swimlaneId: string;
  name: string;
  color: string;
}
