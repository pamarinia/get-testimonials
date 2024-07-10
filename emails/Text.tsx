import { ComponentPropsWithoutRef } from "react";
import { Text as ReactEmailText } from "@react-email/components";

export const Text = (
  props: ComponentPropsWithoutRef<typeof ReactEmailText>
) => {
  return (
    <ReactEmailText
      className="text-base font-light leading-8 text-gray-800"
      {...props}
    ></ReactEmailText>
  );
};
