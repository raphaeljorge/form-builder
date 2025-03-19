import type {
  TextColumnConfig,
  SelectColumnConfig,
  ChipColumnConfig,
  ArrayColumnConfig,
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
  field: TextColumnConfig;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Select field props
 */
export interface SelectFieldProps extends BaseFieldProps {
  field: SelectColumnConfig;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Chip field props
 */
export interface ChipFieldProps extends BaseFieldProps {
  field: ChipColumnConfig;
  value: string[];
  onChange: (value: string[]) => void;
}

/**
 * Array field props
 */
export interface ArrayFieldProps extends BaseFieldProps {
  field: ArrayColumnConfig;
  value: any[];
  onChange: (value: any[]) => void;
  arrayOperations: {
    add: (value: any) => void;
    remove: (index: number) => void;
    move: (from: number, to: number) => void;
    update?: (index: number, value: any) => void;
  };
}