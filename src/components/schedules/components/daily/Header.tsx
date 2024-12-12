interface HeaderProps {
  dayHours: string[];
  contentWidth: number;
}

const Header = (props: HeaderProps) => {
  const { dayHours, contentWidth } = props;

  return (
    <div className="flex items-center justify-end h-[55px] bg-[#f0f4fd]">
      <div
        className="flex"
        style={{
          width: contentWidth,
        }}
      >
        {dayHours.map((hours) => (
          <div key={hours} className="flex-1">
            {hours}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Header;
