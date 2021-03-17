import React from 'react';
import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import Input from 'components/forms/input';
import Textarea from 'components/forms/textarea';
import Select from 'components/forms/select';
import Checkbox from 'components/forms/checkbox';
import Radio from 'components/forms/radio';
import Slider from 'components/forms/slider';
import Button from 'components/button';
import {
  composeValidators,
  booleanValidator,
  arrayValidator,
} from 'components/forms/validations';

export default {
  title: 'Components/Forms',
  parameters: { actions: { argTypesRegex: '^on.*' } },
};

export const Form = (): React.ReactNode => {
  const sliderLabelRef = React.useRef(null);

  return (
    <FormRFF
      debug={() => {
        // console.log(values);
      }}
      onSubmit={() => {
        // console.info(values);
      }}
      // initialValues={{
      //   name: 'Testing initial values',
      //   email: 'barrenechea.miguel@gmail.com',
      //   description: 'Lorem ipsum dolor sit amet',
      //   checkbox: true,
      //   'checkbox-group': ['option-1', 'option-2'],
      //   'radio-group': 'option-1',
      // }}
    >
      {(props) => (
        <form onSubmit={props.handleSubmit} autoComplete="off">
          {/* NAME */}
          <div>
            <FieldRFF
              name="name"
              validate={composeValidators([{ presence: true }])}
            >
              {(fprops) => (
                <Field id="form-name" {...fprops}>
                  <Label className="mb-3 uppercase">Name</Label>
                  <Input />
                </Field>
              )}
            </FieldRFF>
          </div>

          {/* EMAIL */}
          <div className="mt-5">
            <FieldRFF
              name="email"
              validate={composeValidators([{ presence: true, email: true }])}
            >
              {(fprops) => (
                <Field id="form-email" {...fprops}>
                  <Label className="mb-3 uppercase">Email</Label>
                  <Input type="email" />
                </Field>
              )}
            </FieldRFF>
          </div>

          {/* TEXTAREA */}
          <div className="mt-5">
            <FieldRFF
              name="description"
              validate={composeValidators([
                { presence: true, length: { minimum: 20 } },
              ])}
            >
              {(fprops) => (
                <Field id="form-description" {...fprops}>
                  <Label className="mb-3 uppercase">Description</Label>
                  <Textarea rows={4} />
                </Field>
              )}
            </FieldRFF>
          </div>

          {/* SELECT */}
          <div className="mt-5">
            <FieldRFF
              name="category"
              validate={composeValidators([{ presence: true }])}
            >
              {(fprops) => (
                <Field id="form-select" {...fprops}>
                  <Label className="mb-3 uppercase">Category</Label>
                  <Select
                    theme="dark"
                    status="none"
                    size="base"
                    options={[
                      { label: 'Option 1', value: 'option-1' },
                      { label: 'Option 2', value: 'option-2' },
                      { label: 'Option 3', value: 'option-3', disabled: true },
                      { label: 'Option 4', value: 'option-4' },
                    ]}
                  />
                </Field>
              )}
            </FieldRFF>
          </div>

          {/* CHECKBOX */}
          <div className="mt-5">
            <Label className="mb-3 uppercase">Checkbox</Label>
            <FieldRFF
              name="checkbox"
              type="checkbox"
              validate={composeValidators([booleanValidator])}
            >
              {(fprops) => (
                <Field className="flex mt-2" id="form-checkbox" {...fprops}>
                  <Checkbox />
                  <Label className="ml-2">This is a standalone checkbox</Label>
                </Field>
              )}
            </FieldRFF>
          </div>

          {/* CHECKBOX GROUP */}
          <div className="mt-5">
            <Label className="mb-3 uppercase">Checkbox group</Label>
            <FieldRFF
              name="checkbox-group"
              type="checkbox"
              value="option-1"
              validate={composeValidators([arrayValidator])}
            >
              {(fprops) => (
                <Field
                  className="flex mt-2"
                  id="form-checkbox-group-1"
                  {...fprops}
                >
                  <Checkbox />
                  <Label className="ml-2">Option 1</Label>
                </Field>
              )}
            </FieldRFF>

            <FieldRFF
              name="checkbox-group"
              type="checkbox"
              value="option-2"
              validate={composeValidators([arrayValidator])}
            >
              {(fprops) => (
                <Field
                  className="flex mt-2"
                  id="form-checkbox-group-2"
                  {...fprops}
                >
                  <Checkbox />
                  <Label className="ml-2">Option 2</Label>
                </Field>
              )}
            </FieldRFF>
          </div>

          {/* RADIO GROUP */}
          <div className="mt-5">
            <Label className="mb-3 uppercase">Radio group</Label>
            <FieldRFF
              name="radio-group"
              type="radio"
              value="option-1"
              validate={composeValidators([{ presence: true }])}
            >
              {(fprops) => (
                <Field
                  className="flex mt-2"
                  id="radio-group-option-1"
                  {...fprops}
                >
                  <Radio />
                  <Label className="ml-2">Option 1</Label>
                </Field>
              )}
            </FieldRFF>

            <FieldRFF
              name="radio-group"
              type="radio"
              value="option-2"
              validate={composeValidators([{ presence: true }])}
            >
              {(fprops) => (
                <Field
                  className="flex mt-2"
                  id="radio-group-option-2"
                  {...fprops}
                >
                  <Radio />
                  <Label className="ml-2">Option 2</Label>
                </Field>
              )}
            </FieldRFF>
          </div>

          <div className="mt-5">
            <FieldRFF
              name="slider"
              validate={composeValidators([{ presence: true }])}
            >
              {(fprops) => (
                <Field id="form-slider" {...fprops}>
                  <Label ref={sliderLabelRef} className="mb-1 uppercase">
                    Slider
                  </Label>
                  <Slider
                    labelRef={sliderLabelRef}
                    minValue={0}
                    maxValue={1}
                    step={0.01}
                  />
                </Field>
              )}
            </FieldRFF>
          </div>

          <div className="mt-10">
            <Button theme="primary" size="base" type="submit">
              Submit
            </Button>
          </div>
        </form>
      )}
    </FormRFF>
  );
};
