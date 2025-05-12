import clsx from "clsx";

const Card = ({ children, className }) => {
  return (
    <div
      className={clsx(
        "p-6 bg-white shadow-md rounded-lg space-y-4",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;