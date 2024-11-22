import { cn } from '@/lib/utils';
import { Rat } from 'lucide-react';
import Link from 'next/link';
import React from 'react'

function Logo(
{fontSize='text-2xl', iconSize=20}:{fontSize?:String; iconSize?:number;}
) {
  return (
    <Link href={'/'} className={cn("text-2xl font-extrabold flex items-center gap-2",fontSize)}>
      <div className='rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 p-2'>
        <Rat size={iconSize} className='stroke-white'/>
      </div>
      <div>
        <span className='bg-gradient-to-r  from-purple-500 to-purple-600 bg-clip-text text-transparent'>Flow</span>
      <span className='text-stone-700 dark:text-slate-300'>Reo</span>
      </div>
    </Link>
  )
}
export default Logo;