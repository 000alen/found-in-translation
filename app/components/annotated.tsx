interface AnnotatedProps {
  children: React.ReactNode;
  annotation: React.ReactNode;
}

// This component renders the children, and if the children is hovered over, it renders the annotation
export function Annotated(props: AnnotatedProps) {
  return (
    <span className="relative group bg-red-100">
      {props.children}
      {/* <div
        className="absolute top-0 left-0 w-full h-full bg-white bg-opacity-50 rounded-lg group-hover:bg-opacity-100 transition-all duration-300"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {props.annotation}
      </div> */}
    </span>
  );
}
