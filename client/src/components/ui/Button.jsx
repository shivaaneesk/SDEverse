import clsx from "clsx";

const Button = ({ children, className, onClick, type = "button", ...props }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={clsx(
        "px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/80 transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
