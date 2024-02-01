import { ComponentProps, HTMLAttributes, useCallback, useRef, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF, FormProps } from 'react-final-form';

import { useRouter } from 'next/router';

import { AnimatePresence, motion } from 'framer-motion';
import { HiOutlinePencil, HiCheck, HiX } from 'react-icons/hi';

import { useCanEditProject } from 'hooks/permissions';

import { composeValidators } from 'components/forms/validations';
import { cn } from 'utils/cn';

export type FormFields = {
  name: string;
  description: string;
};

const EditableTitle = ({
  title,
  description,
  className,
  onEditTitle,
}: {
  title: string;
  description?: string;
  className?: HTMLAttributes<HTMLDivElement>['className'];
  onEditTitle: (
    newName: Parameters<ComponentProps<typeof FormRFF<FormFields>>['onSubmit']>[0]
  ) => void;
}): JSX.Element => {
  const { query } = useRouter();
  const { pid } = query as { pid: string };
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [editting, setEditting] = useState(false);
  const textRefArea = useRef<HTMLTextAreaElement>(null);

  const editable = useCanEditProject(pid);

  const handleSubmit = useCallback(
    (data: Parameters<ComponentProps<typeof FormRFF<FormFields>>['onSubmit']>[0]) => {
      titleInputRef.current?.blur();
      onEditTitle(data);
      setEditting(false);
    },
    [onEditTitle, titleInputRef]
  );

  const handleEdition = useCallback(() => {
    if (!editting && editable && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current.focus();
      }, 0);
    }
    setEditting(true);
  }, [titleInputRef, editable, editting]);

  const handleCancel = useCallback((form: FormProps<FormFields>['form']) => {
    setEditting(false);
    form.reset();
  }, []);

  const invisibleValue = useCallback((value: string) => {
    if (value) {
      return value.replace(/\s/g, '-');
    }
    return value;
  }, []);

  return (
    <AnimatePresence exitBeforeEnter>
      <motion.div
        key="title"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        className="max-w-[calc(100%-115px)]"
      >
        <FormRFF<FormFields>
          onSubmit={handleSubmit}
          mutators={{
            setTrimName: (args, state, utils) => {
              const [name] = args;
              utils.changeValue(state, 'name', () => name.trim());
            },
          }}
          initialValues={{
            name: title,
            description,
          }}
        >
          {(fprops) => (
            <form
              id="form-title"
              onSubmit={fprops.handleSubmit}
              autoComplete="off"
              className="relative"
            >
              <div className="flex items-center space-x-2">
                <FieldRFF<FormFields['name']>
                  name="name"
                  validate={composeValidators([{ presence: true }])}
                  beforeSubmit={() => {
                    const { values } = fprops;
                    fprops.form.mutators.setTrimName(values.name);
                  }}
                >
                  {({ input }) => (
                    <div
                      className={cn({
                        'relative h-16 overflow-hidden text-ellipsis': true,
                        [className]: Boolean(className),
                      })}
                    >
                      <input
                        {...input}
                        ref={titleInputRef}
                        className="absolute left-0 top-0 h-full w-full cursor-pointer overflow-ellipsis border-none bg-transparent font-heading text-3xl focus:bg-primary-300 focus:text-gray-600 focus:outline-none"
                        disabled={!editting}
                        value={input.value}
                      />

                      <h1 className="invisible h-full overflow-ellipsis px-0 py-1 font-heading text-3xl font-normal">
                        {invisibleValue(input?.value)}
                      </h1>
                    </div>
                  )}
                </FieldRFF>

                <div className="flex space-x-1 ">
                  {editable && !editting && (
                    <motion.button
                      key="edit-button"
                      type="button"
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      className={cn({
                        'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-gray-600 transition-colors hover:border-gray-400 focus:outline-none':
                          true,
                        'bg-white': editting,
                        'bg-transparent': !editting,
                      })}
                      onClick={handleEdition}
                    >
                      <HiOutlinePencil
                        className={cn({
                          'h-5 w-5 text-white transition-colors': true,
                          'text-black': editting,
                        })}
                      />
                    </motion.button>
                  )}
                  {editable && editting && (
                    <motion.button
                      key="save-button"
                      type="submit"
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      className={cn({
                        'flex h-8 w-8 items-center justify-center rounded-full border border-gray-500 transition-colors hover:border-white focus:outline-none':
                          true,
                        'bg-gray-700': editting,
                      })}
                    >
                      <HiCheck className="h-4 w-4 text-white transition-colors" />
                    </motion.button>
                  )}

                  {editable && editting && (
                    <motion.button
                      key="cancel-button"
                      type="button"
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      className={cn({
                        'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-gray-500 transition-colors hover:border-white focus:outline-none':
                          true,
                        'bg-gray-700': editting,
                      })}
                      onClick={() => handleCancel(fprops.form)}
                    >
                      <HiX className="h-4 w-4 text-white transition-colors" />
                    </motion.button>
                  )}
                </div>
              </div>
              <FieldRFF<FormFields['description']> name="description">
                {({ input }) => (
                  <div className="relative w-full">
                    <div
                      className={cn({
                        relative: true,
                        'pb-4': input.value?.length,
                      })}
                    >
                      <>
                        <p className="invisible absolute left-0 top-0 font-heading text-sm font-normal text-white">
                          {input.value}
                        </p>
                        <textarea
                          {...input}
                          ref={textRefArea}
                          className="absolute left-0 top-0 z-50 h-full w-full overflow-ellipsis border-none bg-transparent font-heading text-sm font-normal text-opacity-0 opacity-0 transition-colors focus:bg-primary-300 focus:text-gray-600 focus:opacity-100 focus:outline-none"
                          disabled={!editting}
                          value={input.value}
                          onChange={(v) => {
                            input.onChange(v);
                            const textArea = textRefArea.current;
                            if (textArea) {
                              textArea.style.height = '';
                              textArea.style.height = `${textArea.scrollHeight}px`;
                            }
                          }}
                          onFocus={() => {
                            input.onFocus();
                            const textArea = textRefArea.current;
                            if (textArea) {
                              textArea.style.height = '';
                              textArea.style.height = `${textArea.scrollHeight}px`;
                            }
                          }}
                        />
                      </>
                      <p className="line-clamp-3 font-heading text-sm font-normal text-white">
                        {input.value}
                      </p>
                    </div>
                  </div>
                )}
              </FieldRFF>
            </form>
          )}
        </FormRFF>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditableTitle;
