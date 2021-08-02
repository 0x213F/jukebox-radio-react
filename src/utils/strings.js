

export const truncate = function(input) {
  const MAX_STRING_LENGTH = 8;
  input = input.trim();
  return (
    input.length > MAX_STRING_LENGTH ?
    `${input.substring(0, MAX_STRING_LENGTH - 2)}...` : input
  );
}
