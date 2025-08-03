import { iconLibrary } from './icon-library';

export type IconName = keyof typeof iconLibrary;

type IconProps = {
  name: IconName;
  className?: string;
};

export default function Icon({ name, className }: IconProps) {
  const pathData = iconLibrary[name];

  if (!pathData) {
    return null;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      fill="none"
      className={className}
    >
      {/* 
        LA CORRECCIÓN ESTÁ AQUÍ: 
        En lugar de 'dangerouslySetInnerHTML', usamos el atributo 'd' directamente.
      */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={pathData} 
      />
    </svg>
  );
}