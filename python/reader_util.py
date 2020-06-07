def bracket_reader(string: str, type_of_brace: str) -> list:
    """get to know where a bracket starts and is successfully closed"""
    braces = {'{': '}', '[': ']', '(': ')'}

    if type_of_brace not in braces:
        raise TypeError(f'{type_of_brace} is not supported')

    brace = type_of_brace
    partner_brace = braces.get(type_of_brace)
    brace_positions = []
    position = 0

    # get the position of the first brace
    try:
        start = string.index(brace, position)
    except ValueError:
        start = None

    while start:
        end_position = None
        opening_brace_count = 1

        # loop through the whole string and find the closing brace
        for index, strand in enumerate(string):
            # brace count can only be changed if the loop is beyond index start
            if index > start:
                # if it's another opening brace increment opening_brace_count
                if strand == brace:
                    opening_brace_count += 1

                # if it's a closing brace decrement opening_brace_count
                elif strand == partner_brace:
                    opening_brace_count -= 1

            # when opening_brace_count is 0, it means that an opened bracket is
            # now closed and there's no need to proceed with the loop
            # create an new position to find a new opening brace
            if opening_brace_count == 0:
                end_position = index
                position = index
                break

        # if it does not close raise a value error
        if opening_brace_count:
            raise ValueError('Brackets do not match')

        # add the brace to brace positions [start, end_position] => [[start, end_position]]
        brace_positions.append([start, end_position])

        # check if there's a new brace?
        try:
            start = string.index(brace, position)
        except ValueError:
            start = None

    # return a list of substrings of string with an open and corresponding closing brace
    return [
        string[
            brace_position[0]:brace_position[-1] + 1
        ].translate(str.maketrans('\n', ' ')) for brace_position in brace_positions
    ]
