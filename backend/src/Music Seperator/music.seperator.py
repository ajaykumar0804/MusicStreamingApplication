# import os
# from spleeter.separator import Separator # type: ignore

# def separate_music(input_file, output_dir):
#     # Initialize Spleeter with 4stems model (vocals, drums, bass, other)
#     separator = Separator('spleeter:4stems')

#     # Separate the audio file
#     separator.separate_to_file(input_file, output_dir)

# if __name__ == "__main__":
#     # Example usage
#     input_file = 'path/to/your/audiofile.mp3'
#     output_dir = 'path/to/output/directory'
#     separate_music(input_file, output_dir)


import os
import sys
from spleeter.separator import Separator  # type: ignore

def separate_music(input_file, output_dir):
    # Initialize Spleeter with 4stems model (vocals, drums, bass, other)
    separator = Separator('spleeter:4stems')

    # Separate the audio file
    separator.separate_to_file(input_file, output_dir)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python music.seperator.py <input_file> <output_dir>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_dir = sys.argv[2]

    separate_music(input_file, output_dir)