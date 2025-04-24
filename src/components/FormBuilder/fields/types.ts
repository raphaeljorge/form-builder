import type {
  TextFieldConfig,
  SelectFieldConfig,
  ChipFieldConfig,
  ArrayFieldConfig,
} from "../../../types/form";

/**
 * Base field props
 */
export interface BaseFieldProps {
  error?: string;
  isLoading?: boolean;
}

/**
 * Text field props
 */
export interface TextFieldProps extends BaseFieldProps {
  field: TextFieldConfig;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Select field props
 */
export interface SelectFieldProps extends BaseFieldProps {
  field: SelectFieldConfig;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Chip field props
 */
export interface ChipFieldProps extends BaseFieldProps {
  field: ChipFieldConfig;
  value: string[];
  onChange: (value: string[]) => void;
}

/**
 * Array field props
 */
export interface ArrayFieldProps extends BaseFieldProps {
  field: ArrayFieldConfig;
  value: any[];
  onChange: (value: any[]) => void;
  arrayOperations: {
    add: (value: any) => void;
    remove: (index: number) => void;
    move: (from: number, to: number) => void;
    update?: (index: number, value: any) => void;
  };
}