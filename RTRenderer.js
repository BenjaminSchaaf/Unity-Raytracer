/*
This Script was originally created by (me) Benproductions1
Be advised that it is in no way shape or form not permitted to edit this!
This is designed to be a community project, it will always stay that way!
The Github repository can be found here:
https://github.com/Benproductions1/Unity-Raytracer

I hope you learn something from this project and/or contribute to it :)

HOW TO USE!!
If your just here to see my work,
I suggest making a new scene, throwing in some objects
Adding this script to the camera and see what happens

TIP: if your computer is slow, it will have allot of hang time

TIP: This raytracing uses the CPU, not the GPU

TIP: Do not try real time raytracing with a resolution of 1
*/

/*
---||SETUP||---
*/

import System.IO;

//Raytracer Settings
var RealTime:boolean = true;
var AutoGenerateColliders:boolean = true;
var SmoothEdges:boolean = true;
var SingleMaterialOnly:boolean = false;
var UseLighting:boolean = true;
var resolution:float = 1;
var MaxStack:int = 2;

//The render texture
@System.NonSerialized
var screen:Texture2D;

//The shader used for reflections
private var reflectiveShader:Shader;

//iteration variables
private var x:int;
private var y:int;

private var light:Light;
private var tris:int[];
private var tri:int[];

private var index:int;
private var index2:int;
private var index3:int;

//temporary variables
private var ray:Ray;
private var direction:Vector3;
private var normal:Vector3;

private var tmpFloat:float;
private var tmpFloat2:float;

private var tmpTex:Texture2D;
private var tmpMat:Material;

private var tmpMeshFilter:MeshFilter;
private var tmpGameObject:GameObject;

//List variables for optimisation
private var lights:Light[];

//Collision Mask
private var collisionMask:LayerMask = 1 << 31;


/*
---||INITIALISATION||---
*/

function Start() {
  //If the render texture already exists, destroy it!
	if (screen) {
		Destroy(screen);
	}
	
	//Create a new texture to render to
	screen = new Texture2D(Screen.width*resolution, Screen.height*resolution);
	
	//Find the reflective shader to use (Specular)
	reflectiveShader = Shader.Find("Specular");
	
	if (AutoGenerateColliders) {
		//Generate Raytrace Colliders (mesh) for all renderers
		for (tmpMeshFilter in FindSceneObjectsOfType(typeof MeshFilter) as MeshFilter[]) {
			GenerateColliders(tmpMeshFilter);
		}
	}
	
	if (!RealTime) {
		//Start Single Ray Trace
		RayTrace();
	}
}


/*
---||RUNTIME LOOP||---
*/

function Update() {
	if (RealTime) {
		//Try real time ray tracing
		RayTrace();
	}
}

function OnGUI() {
	//Draw the rendered image along with an FPS count
	GUI.DrawTexture(Rect(0, 0, Screen.width, Screen.height), screen);
	GUILayout.Label("fps: " + Mathf.Round(1/Time.smoothDeltaTime));
}

//One full raytrace
function RayTrace():void {
	//Find all lights and remember them (optimisation)
	lights = FindSceneObjectsOfType(typeof Light) as Light[];
	
	//Iterate through each pixel
	for (x = 0; x < screen.width; x += 1) {
		for (y = 0; y < screen.height; y += 1) {
			//Trace each pixel and set the return value as the colour
			screen.SetPixel(x, y, TracePixel(Vector2(x, y)));
		}
	}
	//Apply changes to the render texture
	screen.Apply();
}

//Raytrace for one pixel
function TracePixel(pos:Vector2):Color {
	//Calculate world position of the pixel and start a single Trace
	ray = camera.ScreenPointToRay(Vector3(pos.x/resolution, pos.y/resolution, 0));
	return TraceRay(ray.origin, ray.direction, 0);
}

//A Single Trace
function TraceRay(origin:Vector3, direction:Vector3, stack:int):Color {
	//Set nessesary temporary local variables
	var tmpColor:Color;
	var hit:RaycastHit;
	
	//Check Stack Flow and perform Raycast
	if (stack < MaxStack && Physics.Raycast(origin, direction, hit, camera.farClipPlane, collisionMask)) {
		
		//Perform calculations only if we hit a collider with a parent (error handling)
		if (hit.collider && hit.collider.transform.parent) {
			//if we have multiple materials and we are checking for multiple materials
			if (hit.collider.transform.parent.GetComponent(MeshFilter).mesh.subMeshCount > 1 && !SingleMaterialOnly) {
				//find material from triangle index
				tmpMat = hit.collider.transform.parent.renderer.materials[GetMatFromTrisInMesh(hit.collider.transform.parent.GetComponent(MeshFilter).mesh, hit.triangleIndex)];
			}
			else {
				//set material to primary material
				tmpMat = hit.collider.transform.parent.renderer.material;
			}
			
			//if the material has a texture
			if (tmpMat.mainTexture) {
				//set the colour to that of the texture coord of the raycast hit
				tmpColor = (tmpMat.mainTexture as Texture2D).GetPixelBilinear(hit.textureCoord.x, hit.textureCoord.y);
			}
			else {
				//set the colour to the colour of the material
				tmpColor = tmpMat.color;
			}
			
			//Transparent pixel, trace again and add on to colour
			if (tmpColor.a < 1) {
				tmpColor *= tmpColor.a;
				tmpColor += (1-tmpColor.a)*TraceRay(hit.point-hit.normal*0.01, direction, stack+1);
			}
			
			//Surface is reflective, trace reflection and add on to colour
			if (tmpMat.shader == reflectiveShader) {
				tmpFloat = tmpColor.a*tmpMat.GetFloat("_Shininess");
				tmpColor += tmpFloat*TraceRay(hit.point+hit.normal*0.0001, Vector3.Reflect(direction, hit.normal), stack+1);
			}
			
			//Calculate lighting
			if (UseLighting) {
				//With smooth edges
				if (SmoothEdges) {
					tmpColor *= TraceLight(hit.point+hit.normal*0.0001, InterpolateNormal(hit.point, hit.normal, hit.collider.transform.parent.GetComponent(MeshFilter).mesh, hit.triangleIndex, hit.transform));
				}
				//Without smooth edges
				else {
					tmpColor *= TraceLight(hit.point+hit.normal*0.0001, hit.normal);
				}
			}
			
			tmpColor.a = 1;
			return tmpColor;
		}
		else {
			//Return Error colour on wierd error
			return Color.red;
		}
	}
	else {
		//Render Skybox if present, else just blue
		if (RenderSettings.skybox) {
			//Perform A Skybox Trace
			tmpColor = SkyboxTrace(direction, RenderSettings.skybox);
			
			//Replace alpha with White colour
			//for some reason nessesary
			tmpColor += Color.white*(1-tmpColor.a)/10;
			tmpColor.a = 1;
			
			return tmpColor;
		}
		else {
			return Color.blue;
		}
	}
}

//Convert a direction to a pixel of a cubemap (used only for skyboxes)
function SkyboxTrace(direction:Vector3, skybox:Material):Color {
	//Funky stuff I still don't quite get
	//If you can explain this, please add comments
	
	if (Mathf.Abs(direction.x) > Mathf.Abs(direction.y)) {
	    if (Mathf.Abs(direction.x) > Mathf.Abs(direction.z)) {
	        if (direction.x < 0) {
	            return (skybox.GetTexture("_LeftTex") as Texture2D).GetPixelBilinear((-direction.z/-direction.x+1)/2, (direction.y/-direction.x+1)/2);
	        }
	        else{
	            return (skybox.GetTexture("_RightTex") as Texture2D).GetPixelBilinear((direction.z/direction.x+1)/2, (direction.y/direction.x+1)/2);
			}
	    }
	    else{
	    	if (direction.z < 0) {
	            return (skybox.GetTexture("_BackTex") as Texture2D).GetPixelBilinear((direction.x/-direction.z+1)/2, (direction.y/-direction.z+1)/2);
			}
			else{
				return (skybox.GetTexture("_FrontTex") as Texture2D).GetPixelBilinear((-direction.x/direction.z+1)/2, (direction.y/direction.z+1)/2);
			}
	    }
	}
	else if (Mathf.Abs(direction.y) > Mathf.Abs(direction.z)){
	    if (direction.y < 0) {
            return (skybox.GetTexture("_DownTex") as Texture2D).GetPixelBilinear((-direction.x/-direction.y+1)/2, (direction.z/-direction.y+1)/2);
        }
        else{
            return (skybox.GetTexture("_UpTex") as Texture2D).GetPixelBilinear((-direction.x/direction.y+1)/2, (-direction.z/direction.y+1)/2);
        }
	}
	else{
	    if (direction.z < 0) {
	            return (skybox.GetTexture("_BackTex") as Texture2D).GetPixelBilinear((direction.x/-direction.z+1)/2, (direction.y/-direction.z+1)/2);
			}
			else{
				return (skybox.GetTexture("_FrontTex") as Texture2D).GetPixelBilinear((-direction.x/direction.z+1)/2, (direction.y/direction.z+1)/2);
			}
	}
}

//Returns the material index of a mesh a triangle is using
//Acctually it returns the index of the submesh the triangle is in
function GetMatFromTrisInMesh(mesh:Mesh, trisIndex:int):int {
	//get the triangel from the triangle index
	tri = [mesh.triangles[trisIndex*3], mesh.triangles[trisIndex*3+1], mesh.triangles[trisIndex*3+2]];
	
	//Iterate through all submeshes, each submesh has a different material of the same index as the submesh
	for (index = 0; index < mesh.subMeshCount; index++) {
		//Get submesh trianges
		tris = mesh.GetTriangles(index);
		//Iterate through all triangles
		for (index2 = 0; index2 < tris.length; index2 += 3) {
			//Find the same triangle and return the index of the submesh it is in
			if (tris[index2] == tri[0] && tris[index2+1] == tri[1] && tris[index2+2] == tri[2]) {
				return index;
			}
		}
	}
}

//Interpolates between the 3 normals of a triangle given the point
function InterpolateNormal(point:Vector3, normal:Vector3, mesh:Mesh, trisIndex:int, trans:Transform):Vector3 {
	//find the indexes of each verticie of the triange
	index = mesh.triangles[trisIndex*3];
	index2 = mesh.triangles[trisIndex*3+1];
	index3 = mesh.triangles[trisIndex*3+2];
	
	//temporary variable used for re-arrenement
	var tmpIndex:int;
	
	//Find the distance between each verticie and the point
	var d1:float = Vector3.Distance(mesh.vertices[index], point);
	var d2:float = Vector3.Distance(mesh.vertices[index2], point);
	var d3:float = Vector3.Distance(mesh.vertices[index3], point);
	
	//compare and rearrange the verticie index so that index is the one furthest away from the point
	if (d2 > d1 && d2 > d3) {
		tmpIndex = index;
		index = index2;
		index2 = tmpIndex;
	}
	else if (d3 > d1 && d3 > d2) {
		tmpIndex = index;
		index = index3;
		index3 = tmpIndex;
		tmpIndex = index2;
		index2 = index3;
		index3 = tmpIndex;
	}
	
	//Find the point along the line between the 2 other verticies that the ray from the furthest verticies through the point intersects
	//Using Plane raycasting
	//Generate Plane
	var plane:Plane = Plane(trans.TransformPoint(mesh.vertices[index2]), trans.TransformPoint(mesh.vertices[index3])+normal, trans.TransformPoint(mesh.vertices[index3])-normal);
	//Renerate Ray
	ray = Ray(trans.TransformPoint(mesh.vertices[index]), (point - trans.TransformPoint(mesh.vertices[index])).normalized);
	
	//Intersect Ray and Plane
	if (!plane.Raycast(ray, tmpFloat)) {
		//Something went terribly wrong... damn it
		Debug.Log("This Shouldn't EVER happen");
		return normal;
	}
	
	//Do the interpolation :D
	//If you really wanna see how this works, just google it
	//It's too complicated to explain here
	var point2:Vector3 = ray.origin+ray.direction*tmpFloat;
	var normal2:Vector3 = Vector3.Lerp(trans.TransformDirection(mesh.normals[index2]), trans.TransformDirection(mesh.normals[index3]), Vector3.Distance(trans.TransformPoint(mesh.vertices[index2]), point2)/Vector3.Distance(trans.TransformPoint(mesh.vertices[index2]), trans.TransformPoint(mesh.vertices[index3])));
	var normal3:Vector3 = Vector3.Lerp(normal2, trans.TransformDirection(mesh.normals[index]), Vector3.Distance(point2, point)/Vector3.Distance(point2, trans.TransformPoint(mesh.vertices[index])));
	//return interpolated normal
	return normal3;
}

//Calculate the lighting of a point
function TraceLight(pos:Vector3, normal:Vector3):Color {
	//set nessesary temporary provate variables
	//set default light to ambient lighting
	var tmpColor:Color = RenderSettings.ambientLight;
	
	//Iterate through all lights in the scene
	//lights is computer once per render (optimisation)
	for (light in lights) {
		//Only calculate lighting if the light is on
		if (light.enabled) {
			//trace the light and add it to the light colour
			tmpColor += LightTrace(light, pos, normal);
		}
	}
	
	//return light colour at that point
	return tmpColor;
}

//Trace lighting for one light at one spot
function LightTrace(light:Light, pos:Vector3, normal:Vector3):Color {
	var hit:RaycastHit;
	
	//If light is directional (easy)
	//Just trace in the opposite direction
	if (light.type == LightType.Directional) {
		direction = light.transform.TransformDirection(Vector3.back);
		return transparancyTrace(Color(light.intensity, light.intensity, light.intensity)*(1-Quaternion.Angle(Quaternion.identity, Quaternion.FromToRotation(normal, direction))/90), pos, direction, Mathf.Infinity);
	}
	
	//If light is point light (medium)
	//Just trace towards it, if within range
	//also apply linear falloff according to distance and range
	if (light.type == LightType.Point) {
		if (Vector3.Distance(pos, light.transform.position) <= light.range) {
			direction = (light.transform.position - pos).normalized;
			tmpFloat = (light.range-Vector3.Distance(pos, light.transform.position))/light.range*light.intensity;
			return transparancyTrace(Color(tmpFloat, tmpFloat, tmpFloat)*(1-Quaternion.Angle(Quaternion.identity, Quaternion.FromToRotation(normal, direction))/90), pos, direction, Vector3.Distance(light.transform.position, pos));
		}
	}
	
	//If light is spot light (Hard)
	//Do the same as a point light, but also get the angle from  direction towards the light to the opposite direction of the light
	//If this angle is more than the spot angle, no light
	//else apply linear fall off according to this angle and spot angle
	if (light.type == LightType.Spot) {
		if (Vector3.Distance(pos, light.transform.position) <= light.range) {
			direction = (light.transform.position - pos).normalized;
			if (Vector3.Angle(direction, -light.transform.forward) < light.spotAngle) {
				tmpFloat = (light.range-Vector3.Distance(pos, light.transform.position))/light.range*light.intensity;
				tmpFloat *= 1 - Vector3.Angle(direction, -light.transform.forward)/light.spotAngle;
				return transparancyTrace(Color(tmpFloat, tmpFloat, tmpFloat)*(1-Quaternion.Angle(Quaternion.identity, Quaternion.FromToRotation(normal, direction))/90), pos, direction, Vector3.Distance(light.transform.position, pos));
			}
		}
	}
	
	//If the light is of any other type, do not calculate any lighting
	return Color.black;
}

//This traces for transparent shadows
//Instead of tracing once to see if an object was hit, it does a RaycastAll
//And Iterates through all objects, gets the pixel colour of that raycast hit
//Then multiples it by the inverse of the alpha of that pixel
function transparancyTrace(col:Color, pos:Vector3, dir:Vector3, dist:float) {
	var tmpColor = col;
	var hits:RaycastHit[];
	var hit:RaycastHit;
	
	//Raycast throug everything, returning a list of hits, instead of just the closest
	hits = Physics.RaycastAll(pos, dir, dist, collisionMask);
	//Iterate through each hit
	for (hit in hits) {
		//Same as in TraceRay, it gets the pixel colour of that hit point
		//So no point in commenting on this
		if (hit.collider.transform.parent.GetComponent(MeshFilter).mesh.subMeshCount > 1 && !SingleMaterialOnly) {
			tmpMat = hit.collider.transform.parent.renderer.materials[GetMatFromTrisInMesh(hit.collider.transform.parent.GetComponent(MeshFilter).mesh, hit.triangleIndex)];
		}
		else {
			tmpMat = hit.collider.transform.parent.renderer.material;
		}
		
		//Apply colour transformation according to pixels alpha value
		if (tmpMat.mainTexture) {
			tmpTex = (tmpMat.mainTexture as Texture2D);
			tmpColor *= 1-tmpTex.GetPixelBilinear(hit.textureCoord.x, hit.textureCoord.y).a;
		}
		else {
			tmpColor *= 1-tmpMat.color.a;
		}
	}
	//return resulting colour
	return tmpColor;
}

//Some stupid unnessesary and unused stuff to save the rendered texture to file
//really not worth explaining
function SaveTextureToFile(texture:Texture2D, fileName):void {
	var bytes = texture.EncodeToPNG();
	var file = new File.Open(Application.dataPath + "/" + fileName,FileMode.Create);
	BinaryWriter(file).Write(bytes);
	file.Close();
}

//Generates colliders used for raytracing for one GamObject
//I wish I could add this to Instantiate!!
function GenerateColliders(go:GameObject):GameObject {
	//Generate colliders only if there is a mesh filter
	if (go.GetComponent(MeshFilter)) {
		GenerateColliders(go.GetComponent(MeshFilter));
	}
	//return same gameObject
	return go;
}

//Generate Colliders for a MeshFilter
function GenerateColliders(mf:MeshFilter):GameObject {
	//Create Object
	tmpGameObject = GameObject("MeshRender");
	//Set Defaults and copy settings
	tmpGameObject.transform.parent = mf.transform;
	tmpGameObject.AddComponent(MeshFilter).mesh = mf.mesh;
	tmpGameObject.AddComponent(MeshCollider).sharedMesh = mf.mesh;
	//Make collider a trigger
	tmpGameObject.collider.isTrigger = true;
	//reset positioning
	tmpGameObject.transform.localPosition = Vector3.zero;
	tmpGameObject.transform.localScale = Vector3.one;
	tmpGameObject.transform.rotation = mf.transform.rotation;
	//set layer
	tmpGameObject.layer = 31;
	//return MeshFilter
	return tmpGameObject;
}
