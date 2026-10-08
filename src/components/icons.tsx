import {
  ArrowClockwise,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChartBar,
  Check,
  Clock,
  Eye,
  Export,
  FilmStrip,
  Info,
  LockSimple,
  Play,
  Question,
  SignOut,
  User,
  X,
  type IconProps,
} from '@phosphor-icons/react';

/**
 * App icon set, backed by Phosphor (one family, regular weight unless noted).
 * Sizes come from CSS (`width`/`height` on the svg), so no size prop here.
 */
const base: IconProps = { weight: 'regular', 'aria-hidden': true, focusable: false };

export const HelpIcon = (props: IconProps) => <Question {...base} {...props} />;
export const StatsIcon = (props: IconProps) => <ChartBar {...base} {...props} />;
export const AboutIcon = (props: IconProps) => <Info {...base} {...props} />;
export const FilmRoomIcon = (props: IconProps) => <FilmStrip {...base} {...props} />;
export const EyeIcon = (props: IconProps) => <Eye {...base} {...props} />;
export const UserIcon = (props: IconProps) => <User {...base} {...props} />;
export const SignOutIcon = (props: IconProps) => <SignOut {...base} {...props} />;
export const CloseIcon = (props: IconProps) => <X {...base} weight="bold" {...props} />;
export const CheckIcon = (props: IconProps) => <Check {...base} weight="bold" {...props} />;
export const ShareIcon = (props: IconProps) => <Export {...base} {...props} />;
export const ReplayIcon = (props: IconProps) => <ArrowClockwise {...base} {...props} />;
export const LockIcon = (props: IconProps) => <LockSimple {...base} {...props} />;
export const ArrowIcon = (props: IconProps) => <ArrowRight {...base} weight="bold" {...props} />;
export const ArrowUpRightIcon = (props: IconProps) => <ArrowUpRight {...base} weight="bold" {...props} />;
export const BackIcon = (props: IconProps) => <ArrowLeft {...base} {...props} />;
export const PlayIcon = (props: IconProps) => <Play {...base} weight="fill" {...props} />;
export const ClockIcon = (props: IconProps) => <Clock {...base} {...props} />;
