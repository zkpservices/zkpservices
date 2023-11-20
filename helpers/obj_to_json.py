import sys
import json


def read_vertices_from_obj(file_path):
    vertices = []
    with open(file_path, "r") as file:
        for line in file:
            components = line.strip().split(" ")
            if components[0] == "v":
                vertex = {
                    "x": float(components[1]),
                    "y": float(components[2]),
                    "z": float(components[3]),
                }
                vertices.append(vertex)
    return vertices


def save_vertices_as_json(vertices, json_path):
    with open(json_path, "w") as json_file:
        json.dump(vertices, json_file)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python obj_to_json.py input.obj output.json")
        sys.exit(1)

    input_obj_path = sys.argv[1]
    output_json_path = sys.argv[2]

    vertices = read_vertices_from_obj(input_obj_path)
    save_vertices_as_json(vertices, output_json_path)
