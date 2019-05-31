export default function getClassNames(obj: {
  [key: string]: boolean | null | undefined;
}) {
  const classes: string[] = [];

  Object.keys(obj).forEach(key => {
    if (obj[key]) {
      classes.push(key);
    }
  });

  return classes.join(" ");
}
