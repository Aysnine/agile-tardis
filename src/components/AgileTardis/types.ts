export type Id = string;
export type Timestamp = number;

export interface RawPrincipleBase {
  id: string;
  name: string;
  trait: PrincipleTrait;
}

type PrincipleTrait = Place | People | Card; // where | who | which

interface Place {
  type: "place";
  order: number;
}

interface People {
  type: "people";
}

interface Card {
  type: "card";
}

export interface RawEventBase {
  id: Id;
  timestamp: Timestamp;
  trait: EventTrait;
}

type EventTrait = Born | Mutate;

type Born = CardBorn | PlaceBorn;

interface CardBorn {
  type: "card-born";
  which: Id;
  where: Id;
  by: Id;
}

interface PlaceBorn {
  type: "place-born";
  where: Id;
  by: Id;
}

type Mutate = CardMove | CardInfoChange | PeopleJoin | PeopleLeave;

interface CardMove {
  type: "card-move";
  which: Id;
  from?: Id;
  to: Id;
  by: Id;
}

interface CardInfoChange {
  type: "card-info-change";
  which: Id;
  snapshot: InfoChangeSnapshot;
  by: Id;
}
interface InfoChangeSnapshot {
  // TODO improve
  from?: any;
  to: any;
}

interface PeopleJoin {
  type: "people-join";
  who: Id;
  to: Id;
  by: Id;
}

interface PeopleLeave {
  type: "people-leave";
  who: Id;
  from?: Id;
  by: Id;
}
