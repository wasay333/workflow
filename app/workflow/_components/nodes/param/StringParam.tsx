"use client"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ParamProps } from '@/types/appNode'
import React, { useEffect, useId, useState } from 'react'

const StringParam = ({param, value, updateNodeParamValue, disabled}:ParamProps) => {
  const [internalValue, setInternalValue] = useState(value);
  const id = useId()
 useEffect(()=>{
  setInternalValue(value);
 },[value])
 
 let Component:any = Input;
 if(param.variant === 'textarea'){
  Component = Textarea
 }

 return (
    <div>
        <Label htmlFor="">
            {param.name}
            {param.required && <p className='text-red-400 px-2'>*</p>}
        </Label>
        <Component
        disabled={disabled}
        className='text-xs'
        id={id}
        value={internalValue}
        placeholder='Enter value here'
        onChange={(e:any)=> setInternalValue(e.target.value)} 
        onBlur={(e:any)=>{updateNodeParamValue(e.target.value)}}/>
        {param.helperText && (
            <p className='text-muted-foreground px-2'>{param.helperText}</p>
        )}
    
    </div>
  )
}

export default StringParam