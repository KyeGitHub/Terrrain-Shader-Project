#version 330

// Matrices
uniform mat4 matrixProjection;
uniform mat4 matrixView;
uniform mat4 matrixModelView;
uniform sampler2D texture0;
uniform sampler2D texture1;

// Materials
uniform vec3 materialAmbient;
uniform vec3 materialDiffuse;
uniform float shininess;

//fog
uniform vec3 fogColour;
uniform float fogStart;
uniform float fogEnd;
uniform float fogDensity;
uniform int	fogOn;

// Lights
struct AMBIENT
{	int on;
	vec3 color;
};

struct DIRECTIONAL
{	int on;
	vec3 direction;
	vec3 diffuse;
	vec3 specularColour;
	float specularPower;
};

uniform AMBIENT lightAmbient;
uniform DIRECTIONAL lightDir;

in vec4 color;
in vec4 position;
in vec3 normal;
in vec2 texCoord0;

out vec4 outColor;

vec3 CalculateSpecular(vec3 lightDir, vec3 vertexN, vec3 vertexP, vec3 lightSpecular, float lightSpecularPower)
{
	vec3 finalSpecular = vec3(0, 0, 0);

	vec3 eyeToVertDir = normalize(-vertexP);
	vec3 reflectDir = normalize(reflect(-lightDir, vertexN));

	float intensity = dot(eyeToVertDir, reflectDir);
	if (intensity > 0 && lightSpecularPower > 0) {
		intensity = shininess * pow(intensity, lightSpecularPower);
		finalSpecular += lightSpecular * intensity;
	}

	return finalSpecular;
}

vec4 CalculateFog(vec3 vPosition, vec4 colour)
{
	float d = length(vPosition);
	float a = pow(2, -fogDensity*d);
	return vec4((1-a) * fogColour + a * colour.rgb, colour.a);


}

vec4 compAmbient(vec3 material, AMBIENT light)
{
	return vec4(material * light.color, 1);
}

vec4 compDirectional(vec3 material, DIRECTIONAL light, vec3 vNormal, vec4 vPosition)
{
	vec3 L = normalize(mat3(matrixView) * light.direction).xyz;
	vec3 specular = CalculateSpecular(L, vNormal, vPosition.xyz,light.specularColour,light.specularPower);
	float NdotL = dot(vNormal.xyz, L);
	if (NdotL > 0)
		return vec4(light.diffuse * material * NdotL + specular, 1);
	else
		return vec4(specular, 1);
}

void main(void) 
{

	vec3 normalMapValue = texture(texture1, texCoord0).rgb * 2 - vec3(1, 1, 1);
	vec3 normalMapInModelSpace = mat3(matrixModelView) * normalMapValue;
	vec3 vNormal = normalize(normal + normalMapInModelSpace);

// calculate the colour
	vec4 lightingColor = vec4(0, 0, 0, 0);

	// ambient & emissive light
	if (lightAmbient.on == 1)
		lightingColor += compAmbient(materialAmbient, lightAmbient);

	// directional lights
	if (lightDir.on == 1)
		lightingColor += compDirectional(materialDiffuse, lightDir, vNormal, position);

	outColor = lightingColor;
	outColor *= texture(texture0, texCoord0);

	if (fogOn == 1)
		outColor = CalculateFog(position.xyz, outColor);



}
