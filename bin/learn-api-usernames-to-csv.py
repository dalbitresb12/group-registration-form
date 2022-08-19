import json


def normalize_host(host: str) -> str:
    host = host.lower().strip()
    if not host.startswith("http://") or not host.startswith("https://"):
        host = "https://" + host
    if host.endswith("/"):
        host = host[:-1]
    return host


def main():
    hostname = input("Enter Blackboard hostname: ")
    hostname = normalize_host(hostname)

    course_id = input("Enter course ID: ")

    url = f"{hostname}/learn/api/v1/courses/{course_id}/memberships?fields=id,role,user.familyName,user.givenName,user.userName&limit=50&offset=0&sort=role(asc),isPreviewStudent(asc),displayOrder(asc),user.familyName(asc),user.givenName(asc),user.userName(asc)"

    print("Login to Blackboard, enter the following URL then save it and enter the path to the file.")
    print(f"\n{url}\n")

    input_name = input("Enter file path: ")
    output_name = input("Enter output file path: ")

    with open(input_name, "r", encoding="utf-8") as input_file:
        parsed = json.load(input_file)
        with open(output_name, "w", encoding="utf-8") as output_file:
            results = parsed["results"]
            for result in results:
                user = result["user"]
                username: str = user["userName"]
                username = username.upper()
                if not username.startswith("U"):
                    continue
                family_name: str = user["familyName"]
                given_name: str = user["givenName"]
                output_file.write(f"{username},{family_name},{given_name}\n")

    print(f"Output saved to {output_name}.")
    input("Press Enter to exit...")


if __name__ == "__main__":
    main()
