import React from 'react'
import { FormControl, FormField, FormLabel, FormMessage } from './ui/form'
import { Input } from './ui/input'
import { Form, Control, FieldPath } from 'react-hook-form'
import z from 'zod'
import { authFormSchema } from '@/lib/utils'

const formSchema = authFormSchema('sign-in')
/**
 * Interface for the props of the CustomInput component.
 * Represents the configuration for a custom input field.
 */
interface CustomInput {
    /**
     * The control object from react-hook-form.
     * Allows access to the form state and methods.
     */
    control: Control<z.infer<typeof formSchema>>;

    /**
     * The name of the field.
     * Represents the path to the field in the form data.
     */
    name: FieldPath<z.infer<typeof formSchema>>;

    /**
     * The label for the input field.
     * Displayed above the input field.
     */
    label: string;

    /**
     * The placeholder text for the input field.
     * Displayed when the input field is empty.
     */
    placeholder: string;
}
const CustomInput = ({ control, name, label, placeholder }: CustomInput) => {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <div className='form-item'>
                    <FormLabel className='form-label'>{label}</FormLabel>
                    <div className='flex w-full flex-col'>
                        <FormControl>
                            <Input
                                placeholder={placeholder}
                                className='input-class'
                                type={name ==='password' ? 'password' : 'text'}
                                {...field}
                            />
                        </FormControl>
                        <FormMessage className='form-message mt-2' />
                    </div>
                </div>
            )}
        />
    )
}

export default CustomInput