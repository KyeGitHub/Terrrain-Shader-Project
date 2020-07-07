#version 330

// Matrices
uniform mat4 matrixProjection;
uniform mat4 matrixView;
uniform mat4 matrixModelView;



layout (location = 0) in vec3 aVertex;
layout (location = 2) in vec3 aNormal;
layout (location = 3) in vec2 aTexCoord;


// Output (sent to Fragment Shader)
out vec4 color;
out vec4 position;
out vec3 normal;
out vec2 texCoord0;



void main(void) 
{
	// calculate position & normal
	position = matrixModelView * vec4(aVertex, 1.0);
	gl_Position = matrixProjection * position;
	normal = mat3(matrixModelView) * aNormal;

	texCoord0 = aTexCoord;


}
 