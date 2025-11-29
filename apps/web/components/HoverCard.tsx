import {
  HoverCardContent,
  HoverCardTrigger,
  HoverCard as HoverCardUi,
} from '@/components/ui/hover-card';

export function HoverCard(props: {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}) {
  return (
    <HoverCardUi openDelay={100} closeDelay={100}>
      <HoverCardTrigger asChild>{props.children}</HoverCardTrigger>
      <HoverCardContent className={props.className} align="start" side="right">
        {props.content}
      </HoverCardContent>
    </HoverCardUi>
  );
}
