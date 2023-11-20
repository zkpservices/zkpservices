import sys
import numpy as np


def read_vertices_from_obj(file_path):
    vertices = []
    with open(file_path, "r") as file:
        for line in file:
            components = line.strip().split(" ")
            if components[0] == "v":
                vertex = list(map(float, components[1:]))
                vertices.append(vertex)
    return np.array(vertices)


vertices = read_vertices_from_obj(sys.argv[1])
np.savetxt(sys.argv[1]+".csv", vertices, delimiter=",")
