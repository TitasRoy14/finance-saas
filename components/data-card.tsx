import { IconType } from 'react-icons';
import { VariantProps, cva } from 'class-variance-authority';
import { cn, formatCurrency } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import CountUp from '@/components/count-up';
import { Skeleton } from './ui/skeleton';

const boxVariant = cva('rounded-md p-3', {
  variants: {
    variant: {
      default: 'bg-blue-500/20',
      success: 'bg-emerald-500/20',
      danger: 'bg-rose-500/20',
      warning: 'bg-yellow-500/20',
      bluish:'bg-[#261147]/20'
    },
  },
  defaultVariants: {
    variant: 'bluish',
  },
});

const iconVariant = cva('shrink-0 size-6', {
  variants: {
    variant: {
      default: 'fill-blue-500',
      success: 'fill-emerald-500',
      danger: 'fill-rose-500',
      warning: 'fill-yellow-500',
      bluish:'fill-[#261147]'
    },
  },
  defaultVariants: {
    variant: 'bluish',
  },
});

type BoxVariants = VariantProps<typeof boxVariant>;
type IconVariants = VariantProps<typeof iconVariant>;

interface DataCardProps extends BoxVariants, IconVariants {
  icon: IconType;
  title: string;
  value?: number;
  dateRange: string;
  percentageChange?: number;
}

export const DataCard = ({
  title,
  icon: Icon,
  dateRange,
  value = 0,
  variant,
}: DataCardProps) => {
  return (
    <Card className='border-none drop-shadow-xs'>
      <CardHeader className='flex flex-row items-center justify-between gap-x-4'>
        <div className='space-y-2'>
          <CardTitle className='text-2xl line-clamp-1'>{title}</CardTitle>
          <CardDescription className='line-clamp-1'>
            {dateRange}
          </CardDescription>
        </div>
        <div className={cn(boxVariant({ variant }))}>
          <Icon className={cn(iconVariant({ variant }))} />
        </div>
      </CardHeader>
      <CardContent>
        <h1 className='font-bold text-2xl mb-2 line-clamp-1 break-all'>
          <CountUp
            preserveValue
            start={0}
            end={value}
            decimals={2}
            decimalPlaces={2}
            formattingFn={formatCurrency}
          />
        </h1>
        {/* <p
          className={cn(
            'text-muted-foreground text-sm line-clamp-1',
            percentageChange > 0 && 'text-emerald-500',
            percentageChange < 0 && 'text-rose-500'
          )}
        >
          {formatPercentage(percentageChange, { addPrefix: true })} from last
          period
        </p> */}
      </CardContent>
    </Card>
  );
};

export const DataCardLoading = () => {
  return (
    <Card className='border-none drop-shadow-xs h-[192px]'>
      <CardHeader className='flex flex-row items-center justify-between gap-x-4'>
        <div>
          <Skeleton className='h-6 w-24' />
          <Skeleton className='h-4 w-40' />
        </div>
        <Skeleton className='size-12' />
      </CardHeader>
      <CardContent>
        <Skeleton className='shrink-0 h-10 w-24 mb-2' />
        <Skeleton className='shrink-0 h-4 w-40' />
      </CardContent>
    </Card>
  );
};
